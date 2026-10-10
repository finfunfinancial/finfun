"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badges, loadProgress } from "@/components/lms/progress";
import { BuyerPage, Loaded, Notice } from "@/components/lms/ui";
import { day, time, when } from "@/lib/lms/format";
import { fileUrl, fn, must, supabase } from "@/lib/lms/supabase";
import { useAction, useData } from "@/lib/lms/use-data";

const JOIN_EARLY_MS = 10 * 60e3;

// One purchased course: next live class, lessons, FinCoins, badges, recordings, certificate.
export default function CoursePage() {
  return <BuyerPage><Course /></BuyerPage>;
}

function Course() {
  const { id } = useParams<{ id: string }>();
  const [now] = useState(() => Date.now());
  const { data, error } = useData(async () => {
    const enrolment = must(await supabase.from("enrolments").select("id, status, student_id, program_id, batch_id, programs(name)").eq("id", id).single());
    const p = await loadProgress(enrolment.student_id);
    const modules = p.moduleProgress.filter((m: any) => m.program_id === enrolment.program_id);
    const [sessions, lessons] = await Promise.all([
      enrolment.batch_id
        ? supabase.from("sessions").select("id, number, starts_at, duration_min, status, recording_path").eq("batch_id", enrolment.batch_id).neq("status", "cancelled").order("starts_at").then(must)
        : Promise.resolve([] as any[]),
      modules.length
        ? supabase.from("lessons").select("id, module_id, position, title, content_items(id, language)").in("module_id", modules.map((m: any) => m.id)).order("position").then(must)
        : Promise.resolve([] as any[]),
    ]);
    const done = must(await supabase.from("progress").select("content_item_id").eq("student_id", enrolment.student_id).eq("status", "done"));
    const certificate = p.certificates.find((c: any) => c.program_id === enrolment.program_id);
    return { enrolment, ...p, modules, sessions, lessons, done: new Set(done.map((x: any) => x.content_item_id)), certificate };
  }, [id]);

  return (
    <Loaded data={data} error={error}>
      {(d) => {
        const next = d.sessions.find((s: any) => Date.parse(s.starts_at) + s.duration_min * 60e3 > now && s.status !== "completed");
        const recordings = d.sessions.filter((s: any) => s.recording_path).reverse();
        return (
          <>
            <p><Link href="/my-courses">← My courses</Link></p>
            <section className="card hero">
              <img src="/a/sticker/10-hi-im-rupi.webp" alt="" />
              <div>
                <h1>{(d.enrolment as any).programs.name}</h1>
                <p style={{ margin: 0, fontSize: "1.15rem" }}>
                  {d.student.nickname || d.student.first_name} has <strong>{d.coins} FinCoins</strong> and <strong>{d.awards.length} badges</strong>. Keep going!
                </p>
              </div>
            </section>

            {d.certificate && (
              <Notice kind="ok">🎉 Course completed! <Link href={`/certificate/${d.certificate.id}`}>View and print the certificate</Link></Notice>
            )}

            {next && (
              <section className="card next-class">
                <h2>Next live class</h2>
                <p style={{ fontSize: "1.2rem" }}><strong>{day(next.starts_at)}</strong> at <strong>{time(next.starts_at)}</strong> · class {next.number}</p>
                <JoinButton sessionId={next.id} studentId={d.enrolment.student_id} open={now >= Date.parse(next.starts_at) - JOIN_EARLY_MS} />
              </section>
            )}

            {d.modules.map((m: any) => {
              const lessons = d.lessons.filter((l: any) => l.module_id === m.id);
              return (
                <section key={m.id} className="card">
                  <div className="spread">
                    <h2 style={{ margin: 0 }}>{m.position}. {m.title}</h2>
                    <span className="fine">{m.done} / {m.total} done</span>
                  </div>
                  <div className="bar" style={{ margin: "10px 0 14px" }}><span style={{ width: `${m.total ? (100 * m.done) / m.total : 0}%` }} /></div>
                  {lessons.length ? (
                    <ul className="lesson-list">
                      {lessons.map((l: any) => {
                        const items = l.content_items.filter((c: any) => c.language === "en");
                        const n = items.filter((c: any) => d.done.has(c.id)).length;
                        return (
                          <li key={l.id}>
                            <Link href={`/my-courses/${id}/lessons/${l.id}`}>
                              <span>{l.title}</span>
                              <span className="fine">{items.length && n === items.length ? "✓ Done" : `${n} / ${items.length}`}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : <p className="muted">Lessons coming soon.</p>}
                </section>
              );
            })}

            <section className="card">
              <h2>Badges</h2>
              <Badges badges={d.badges} awards={d.awards} />
            </section>

            {recordings.length > 0 && (
              <section className="card">
                <h2>Class recordings</h2>
                <ul className="lesson-list">
                  {recordings.map((s: any) => <li key={s.id}><Recording s={s} /></li>)}
                </ul>
              </section>
            )}
          </>
        );
      }}
    </Loaded>
  );
}

/** Asks the backend for a Zoom join token (BAT-3). Until Zoom is connected the backend says so politely. */
function JoinButton({ sessionId, studentId, open }: { sessionId: string; studentId: string; open: boolean }) {
  const { busy, error, run } = useAction();
  const [ready, setReady] = useState(false);
  const join = () => run(async () => {
    await fn("join-session", { sessionId, studentId });
    // TODO(Zoom): mount the Zoom Meeting SDK here with the returned signature, so the class opens inside this page.
    setReady(true);
  });
  return (
    <div className="stack" style={{ gap: 8 }}>
      <button className="btn blue lg" onClick={join} disabled={!open || busy} style={{ justifySelf: "start" }}>
        {busy ? "Joining…" : open ? "Join live class" : "Join opens 10 minutes before class"}
      </button>
      <Notice kind="error">{error}</Notice>
      {ready && <Notice kind="ok">You’re in! The class will open here.</Notice>}
    </div>
  );
}

function Recording({ s }: { s: any }) {
  const watch = async () => {
    const url = await fileUrl("recordings", s.recording_path);
    if (url) window.open(url, "_blank", "noopener");
  };
  return (
    <button className="link" style={{ textAlign: "left", textDecoration: "none", color: "var(--ink)", width: "100%" }} onClick={watch}>
      <span className="spread" style={{ width: "100%" }}><span>Class {s.number} · {when(s.starts_at)}</span><span>▶ Watch</span></span>
    </button>
  );
}
