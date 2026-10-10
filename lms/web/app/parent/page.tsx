"use client";
import Link from "next/link";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead, statusChip } from "@/components/ui";
import { useUser } from "@/lib/auth";
import { clock, weekdays, when } from "@/lib/format";
import { fn, must, supabase } from "@/lib/supabase";
import { useAction, useData } from "@/lib/use-data";

type Login = { name: string; username: string; pin: string };

// Parent home: each child, their enrolments and logins (ACC-2, ACC-3, PAY-5).
export default function ParentHome() {
  const me = useUser();
  const [login, setLogin] = useState<Login | null>(null);
  const { data, error, reload } = useData(async () => {
    const links = must(await supabase.from("guardian_links").select("students(id, first_name, nickname, grade, username)").eq("parent_id", me.id));
    const children = links.map((l: any) => l.students);
    if (!children.length) return { children, enrolments: [], next: {} as Record<string, string> };
    const enrolments = must(await supabase.from("enrolments")
      .select("id, student_id, status, program_id, programs(name, slug), batches(id, name, weekday, start_time)")
      .in("student_id", children.map((c: any) => c.id)).neq("status", "expired").order("created_at", { ascending: false }));
    const batchIds = enrolments.map((e: any) => e.batches?.id).filter(Boolean);
    const upcoming = batchIds.length
      ? must(await supabase.from("sessions").select("batch_id, starts_at").in("batch_id", batchIds).eq("status", "scheduled").gte("starts_at", new Date().toISOString()).order("starts_at"))
      : [];
    const next: Record<string, string> = {};
    upcoming.forEach((s: any) => (next[s.batch_id] ??= s.starts_at));
    return { children, enrolments, next };
  }, [me.id]);

  return (
    <>
      <PageHead title={`Hello${me.full_name ? `, ${me.full_name.split(" ")[0]}` : ""}!`} sub="Your children's FinFun classes, logins and progress.">
        <Link className="btn" href="/parent/enrol">Enrol in a program</Link>
      </PageHead>
      {login && (
        <Notice kind="ok">
          {login.name}'s login — username <span className="secret">{login.username}</span> PIN <span className="secret">{login.pin}</span>.
          Write it down: we can't show this PIN again (you can always reset it).
        </Notice>
      )}
      <Loaded data={data} error={error}>
        {(d) => (
          <>
            {d.children.length ? (
              <div className="grid wide" style={{ marginTop: 16 }}>
                {d.children.map((c: any) => (
                  <ChildCard key={c.id} c={c} enrolments={d.enrolments.filter((e: any) => e.student_id === c.id)} next={d.next}
                    onPin={(p) => setLogin({ name: c.first_name, ...p })} onChange={reload} />
                ))}
              </div>
            ) : <Empty>Add your child below to get started.</Empty>}
            <AddChild onAdded={(l) => { setLogin(l); reload(); }} />
          </>
        )}
      </Loaded>
    </>
  );
}

function ChildCard({ c, enrolments, next, onPin, onChange }: { c: any; enrolments: any[]; next: Record<string, string>; onPin: (p: { username: string; pin: string }) => void; onChange: () => void }) {
  const resetPin = async () => {
    if (!confirm(`Give ${c.first_name} a new PIN? The old one stops working.`)) return;
    try {
      onPin(await fn(`children/${c.id}/reset-pin`, {}));
    } catch (e) {
      alert((e as Error).message);
    }
  };
  return (
    <section className="card">
      <div className="spread">
        <h2 style={{ margin: 0 }}>{c.first_name}{c.nickname && <span className="fine"> “{c.nickname}”</span>}</h2>
        <span className="chip">Grade {c.grade}</span>
      </div>
      <p className="fine">Username <strong>{c.username}</strong> · <button className="link" onClick={resetPin}>Reset PIN</button></p>
      {enrolments.length ? enrolments.map((e) => (
        <div key={e.id} className="stack" style={{ borderTop: "1px solid var(--line-soft)", paddingTop: 12, marginTop: 12, gap: 8 }}>
          <div className="spread"><strong>{e.programs.name}</strong>{statusChip(e.status)}</div>
          {e.status === "pending" && <p className="fine" style={{ margin: 0 }}>Awaiting payment. <Link href={`/parent/enrol?child=${c.id}&program=${e.programs.slug}`}>Pay now</Link> or our team will contact you.</p>}
          {e.status === "active" && !e.batches && <PickBatch e={e} onDone={onChange} />}
          {e.batches && (
            <p className="fine" style={{ margin: 0 }}>
              {e.batches.name} · {weekdays[e.batches.weekday]}s {clock(e.batches.start_time)}
              {next[e.batches.id] && <><br />Next class: <strong>{when(next[e.batches.id])}</strong></>}
              {e.status === "waitlisted" && <><br />On the waitlist — we'll confirm a seat soon.</>}
            </p>
          )}
        </div>
      )) : <p className="muted">Not enrolled yet. <Link href={`/parent/enrol?child=${c.id}`}>Enrol {c.first_name}</Link></p>}
      <div className="row end" style={{ marginTop: 14 }}>
        <Link className="btn white sm" href={`/parent/children/${c.id}`}>Progress report</Link>
      </div>
    </section>
  );
}

/** After paying, the parent picks a weekly slot (PAY-5). Full batches put the child on the waitlist. */
function PickBatch({ e, onDone }: { e: any; onDone: () => void }) {
  const { data } = useData(() =>
    supabase.from("batches").select("id, name, weekday, start_time, start_date, seat_limit, enrolments(count)")
      .eq("program_id", e.program_id).eq("status", "open").is("section_id", null).eq("enrolments.status", "active").order("start_date").then(must),
    [e.program_id]);
  const { busy, error, run } = useAction();
  const pick = (batchId: string) => run(async () => {
    const status = must(await supabase.rpc("assign_batch", { p_enrolment: e.id, p_batch: batchId }));
    if (status === "waitlisted") alert("That batch just filled up, so your child is on its waitlist. We'll confirm a seat soon.");
    onDone();
  });
  if (!data) return null;
  if (!data.length) return <p className="fine" style={{ margin: 0 }}>Paid! We're opening new batches — we'll message you when one is ready.</p>;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <strong className="fine">Pick a weekly class time:</strong>
      {data.map((b: any) => {
        const left = b.seat_limit - (b.enrolments[0]?.count ?? 0);
        return (
          <button key={b.id} className="btn white sm" style={{ justifyContent: "space-between" }} onClick={() => pick(b.id)} disabled={busy}>
            <span>{weekdays[b.weekday]}s {clock(b.start_time)}</span>
            <span className="fine">{left > 0 ? `${left} seats left` : "Waitlist"}</span>
          </button>
        );
      })}
      <Notice kind="error">{error}</Notice>
    </div>
  );
}

function AddChild({ onAdded }: { onAdded: (l: Login) => void }) {
  const { busy, error, run } = useAction();
  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      const r = await fn("children", { firstName: f.get("firstName"), grade: Number(f.get("grade")), nickname: f.get("nickname"), consent: f.get("consent") === "on" });
      form.reset();
      onAdded({ name: r.student.firstName, username: r.username, pin: r.pin });
    });
  };
  return (
    <details className="panel" style={{ marginTop: 20 }}>
      <summary>Add a child</summary>
      <div>
        <form className="stack" onSubmit={add}>
          <div className="fields">
            <label>First name<input name="firstName" maxLength={40} required /></label>
            <label>Grade
              <select name="grade" defaultValue={6}>{[3, 4, 5, 6, 7, 8, 9, 10].map((g) => <option key={g} value={g}>Grade {g}</option>)}</select>
            </label>
            <label>Nickname (optional)<input name="nickname" maxLength={30} /></label>
          </div>
          <label className="check">
            <input type="checkbox" name="consent" required />
            <span>I am this child's parent or guardian. I agree to FinFun storing their first name and grade to run their classes, as described in the <a href="https://www.finfun.club/privacy" target="_blank" rel="noreferrer">privacy policy</a>. I can delete this at any time.</span>
          </label>
          <p className="fine" style={{ margin: 0 }}>We create a username and PIN for your child. We never ask for their surname, photo, phone or email.</p>
          <Notice kind="error">{error}</Notice>
          <div className="row end"><button className="btn" disabled={busy}>{busy ? "Creating login…" : "Add child"}</button></div>
        </form>
      </div>
    </details>
  );
}
