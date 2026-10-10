"use client";
import Link from "next/link";
import { BuyerPage, Empty, Loaded, LogOut, Notice, PageHead, statusChip } from "@/components/lms/ui";
import { useUser } from "@/lib/lms/auth";
import { clock, weekdays, when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useAction, useData } from "@/lib/lms/use-data";

// The buyer’s portal: every course they bought, and only theirs (RLS).
export default function MyCoursesPage() {
  return <BuyerPage><MyCourses /></BuyerPage>;
}

function MyCourses() {
  const me = useUser();
  const { data, error, reload } = useData(async () => {
    const links = must(await supabase.from("guardian_links").select("student_id").eq("parent_id", me.id));
    const ids = links.map((l) => l.student_id);
    if (!ids.length) return { courses: [], next: {} as Record<string, string> };
    const courses = must(await supabase.from("enrolments")
      .select("id, status, program_id, students(id, first_name), programs(name, slug, sticker), batches(id, name, weekday, start_time)")
      .in("student_id", ids).neq("status", "expired").order("created_at", { ascending: false }));
    const batchIds = courses.map((c: any) => c.batches?.id).filter(Boolean);
    const upcoming = batchIds.length
      ? must(await supabase.from("sessions").select("batch_id, starts_at").in("batch_id", batchIds).eq("status", "scheduled").gte("starts_at", new Date().toISOString()).order("starts_at"))
      : [];
    const next: Record<string, string> = {};
    upcoming.forEach((s: any) => (next[s.batch_id] ??= s.starts_at));
    return { courses, next };
  }, [me.id]);

  return (
    <>
      <PageHead title="My courses" sub={<>Logged in as {me.email} · <LogOut /></>}>
        <Link className="btn" href="/enrol">Buy a course</Link>
      </PageHead>
      <Loaded data={data} error={error}>
        {(d) => d.courses.length ? (
          <div className="grid wide">
            {d.courses.map((c: any) => <CourseCard key={c.id} c={c} next={d.next} onChange={reload} />)}
          </div>
        ) : (
          <Empty>You haven’t bought a course yet. <Link href="/enrol">Choose a program</Link> to get started.</Empty>
        )}
      </Loaded>
    </>
  );
}

function CourseCard({ c, next, onChange }: { c: any; next: Record<string, string>; onChange: () => void }) {
  return (
    <section className="card stack">
      <div className="spread">
        <div className="row">
          <img src={c.programs.sticker} alt="" width={56} height={56} />
          <div>
            <h2 style={{ margin: 0 }}>{c.programs.name}</h2>
            <span className="fine">For {c.students.first_name}</span>
          </div>
        </div>
        {statusChip(c.status)}
      </div>
      {c.status === "pending" && (
        <Notice>Awaiting payment. <Link href={`/enrol?program=${c.programs.slug}`}>Pay now</Link>, or our team will contact you.</Notice>
      )}
      {c.status === "active" && !c.batches && <PickBatch e={c} onDone={onChange} />}
      {c.batches && (
        <p className="fine" style={{ margin: 0 }}>
          Live class: {weekdays[c.batches.weekday]}s {clock(c.batches.start_time)}
          {next[c.batches.id] && <><br />Next class: <strong>{when(next[c.batches.id])}</strong></>}
          {c.status === "waitlisted" && <><br />On the waitlist — we’ll confirm a seat soon.</>}
        </p>
      )}
      {["active", "completed"].includes(c.status) && (
        <div className="row end"><Link className="btn blue" href={`/my-courses/${c.id}`}>Open course</Link></div>
      )}
    </section>
  );
}

/** After paying, the buyer picks a weekly class time (PAY-5). Full batches put them on the waitlist. */
function PickBatch({ e, onDone }: { e: any; onDone: () => void }) {
  const { data } = useData(() =>
    supabase.from("batches").select("id, name, weekday, start_time, start_date, seat_limit, enrolments(count)")
      .eq("program_id", e.program_id).eq("status", "open").is("section_id", null).eq("enrolments.status", "active").order("start_date").then(must),
    [e.program_id]);
  const { busy, error, run } = useAction();
  const pick = (batchId: string) => run(async () => {
    const status = must(await supabase.rpc("assign_batch", { p_enrolment: e.id, p_batch: batchId }));
    if (status === "waitlisted") alert("That class just filled up, so you’re on its waitlist. We’ll confirm a seat soon.");
    onDone();
  });
  if (!data) return null;
  if (!data.length) return <p className="fine" style={{ margin: 0 }}>Paid! We’re opening new class times — we’ll message you when one is ready.</p>;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <strong className="fine">Pick your weekly live class time:</strong>
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
