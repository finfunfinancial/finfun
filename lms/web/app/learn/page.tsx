"use client";
import Link from "next/link";
import { useState } from "react";
import { Badges, loadProgress } from "@/components/progress";
import { Empty, Loaded, Notice } from "@/components/ui";
import { useUser } from "@/lib/auth";
import { day, time, when } from "@/lib/format";
import { fileUrl, fn, must, supabase } from "@/lib/supabase";
import { useAction, useData } from "@/lib/use-data";

const JOIN_EARLY_MS = 10 * 60e3;

// Student home (LRN-1): next class, lessons, FinCoins, badges, certificates.
export default function LearnHome() {
  const me = useUser();
  const { data, error } = useData(async () => {
    const me_ = must(await supabase.from("students").select("id").eq("auth_user_id", me.id).single());
    const p = await loadProgress(me_.id);
    const batchIds = p.enrolments.map((e: any) => e.batch_id).filter(Boolean);
    const [sessions, lessons, progress] = await Promise.all([
      batchIds.length
        ? supabase.from("sessions").select("id, number, starts_at, duration_min, status, recording_path, has_zoom").in("batch_id", batchIds).neq("status", "cancelled").order("starts_at").then(must)
        : Promise.resolve([] as any[]),
      p.moduleProgress.length
        ? supabase.from("lessons").select("id, module_id, position, title, content_items(id, language)").in("module_id", p.moduleProgress.map((m: any) => m.id)).order("position").then(must)
        : Promise.resolve([] as any[]),
      supabase.from("progress").select("content_item_id").eq("student_id", me_.id).eq("status", "done").then(must),
    ]);
    const done = new Set(progress.map((x: any) => x.content_item_id));
    return { ...p, sessions, lessons, done };
  }, [me.id]);

  return (
    <Loaded data={data} error={error}>
      {(d) => {
        const now = Date.now();
        const next = d.sessions.find((s: any) => Date.parse(s.starts_at) + s.duration_min * 60e3 > now && s.status !== "completed");
        const recordings = d.sessions.filter((s: any) => s.recording_path).reverse();
        return (
          <>
            <section className="card hero">
              <img src="/a/sticker/10-hi-im-rupi.webp" alt="" />
              <div>
                <h1>Hi {d.student.nickname || d.student.first_name}!</h1>
                <p style={{ margin: 0, fontSize: "1.15rem" }}>You have <strong>{d.coins} FinCoins</strong> and <strong>{d.awards.length} badges</strong>. Keep going!</p>
              </div>
            </section>

            {!d.enrolments.length && <Empty>You're not in a FinFun program yet. Ask a parent to enrol you!</Empty>}

            {next && (
              <section className="card next-class">
                <h2>Next live class</h2>
                <p style={{ fontSize: "1.2rem" }}><strong>{day(next.starts_at)}</strong> at <strong>{time(next.starts_at)}</strong> · class {next.number}</p>
                <JoinButton session={next} open={now >= Date.parse(next.starts_at) - JOIN_EARLY_MS} />
              </section>
            )}

            {d.moduleProgress.map((m: any) => {
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
                            <Link href={`/learn/lessons/${l.id}`}>
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
              <h2>My badges</h2>
              <Badges badges={d.badges} awards={d.awards} />
            </section>

            {d.certificates.length > 0 && (
              <section className="card">
                <h2>My certificates</h2>
                {d.certificates.map((c: any) => <p key={c.id}><Link href={`/certificate/${c.id}`}>{c.programs.name} certificate 🎉</Link></p>)}
              </section>
            )}

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
function JoinButton({ session, open }: { session: any; open: boolean }) {
  const { busy, error, run } = useAction();
  const [ready, setReady] = useState(false);
  const join = () => run(async () => {
    await fn("join-session", { sessionId: session.id });
    // TODO(Zoom): mount the Zoom Meeting SDK here with the returned signature, so the class opens inside this page.
    setReady(true);
  });
  return (
    <div className="stack" style={{ gap: 8 }}>
      <button className="btn blue lg" onClick={join} disabled={!open || busy} style={{ justifySelf: "start" }}>
        {busy ? "Joining…" : open ? "Join live class" : "Join opens 10 minutes before class"}
      </button>
      <Notice kind="error">{error}</Notice>
      {ready && <Notice kind="ok">You're in! The class will open here.</Notice>}
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
