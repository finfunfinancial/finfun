"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loaded, Notice } from "@/components/ui";
import { useUser } from "@/lib/auth";
import { fileUrl, must, supabase } from "@/lib/supabase";
import { useAction, useData } from "@/lib/use-data";

// One lesson: its activities in order. Non-quiz activities are ticked off; quizzes are graded by the server.
export default function Lesson() {
  const { id } = useParams<{ id: string }>();
  const me = useUser();
  const { data, error, reload } = useData(async () => {
    const lesson = must(await supabase.from("lessons").select("id, title, modules(title), content_items(id, position, kind, title, asset_path, quiz, duration_min, language)").eq("id", id).single());
    const student = must(await supabase.from("students").select("id, language").eq("auth_user_id", me.id).single());
    const items = (lesson.content_items as any[]).filter((c) => c.language === "en").sort((a, b) => a.position - b.position);
    const progress = items.length
      ? must(await supabase.from("progress").select("content_item_id, status, score").eq("student_id", student.id).in("content_item_id", items.map((c) => c.id)))
      : [];
    return { lesson, items, progress: Object.fromEntries(progress.map((p: any) => [p.content_item_id, p])) };
  }, [id]);

  return (
    <Loaded data={data} error={error}>
      {(d) => (
        <>
          <p><Link href="/learn">← Home</Link></p>
          <h1>{d.lesson.title}</h1>
          <p className="muted">{(d.lesson as any).modules?.title}</p>
          {d.items.length ? d.items.map((c: any, i: number) => (
            <section key={c.id} className="card">
              <div className="spread">
                <h2 style={{ margin: 0 }}>{i + 1}. {c.title}</h2>
                {d.progress[c.id]?.status === "done" && <span className="chip s-done">✓ Done{c.kind === "quiz" ? ` · ${d.progress[c.id].score}%` : ""}</span>}
              </div>
              {c.duration_min && <p className="fine">About {c.duration_min} minutes</p>}
              {c.kind === "quiz" ? <Quiz item={c} onDone={reload} /> : <Activity item={c} done={d.progress[c.id]?.status === "done"} onDone={reload} />}
            </section>
          )) : <p className="muted">This lesson's activities are coming soon.</p>}
        </>
      )}
    </Loaded>
  );
}

const youtubeId = (url: string) => url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)?.[1];

function Activity({ item, done, onDone }: { item: any; done: boolean; onDone: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const { busy, error, run } = useAction();
  useEffect(() => {
    if (!item.asset_path) return;
    if (item.asset_path.startsWith("https://")) setUrl(item.asset_path);
    else fileUrl("content", item.asset_path).then(setUrl);
  }, [item.asset_path]);

  const complete = () => run(async () => {
    must(await supabase.rpc("complete_item", { p_item: item.id }));
    onDone();
  });

  const yt = url && youtubeId(url);
  const isPdf = url && /\.pdf(\?|$)/i.test(url);
  return (
    <div className="stack">
      {url && (
        yt ? <iframe className="viewer" src={`https://www.youtube-nocookie.com/embed/${yt}`} title={item.title} allow="encrypted-media; fullscreen" allowFullScreen />
        : item.kind === "video" ? <video className="viewer" src={url} controls />
        : isPdf || item.kind === "slides" ? <iframe className="viewer" src={url} title={item.title} style={{ aspectRatio: "4 / 3" }} />
        : item.kind === "game" ? <iframe className="viewer" src={url} title={item.title} style={{ aspectRatio: "4 / 3" }} />
        : null
      )}
      {url && <p className="fine" style={{ margin: 0 }}><a href={url} target="_blank" rel="noreferrer">Open in a new tab</a>{item.kind === "pdf" && " to download or print"}</p>}
      {!url && item.asset_path && <p className="muted">Loading…</p>}
      <Notice kind="error">{error}</Notice>
      {!done && <button className="btn" onClick={complete} disabled={busy} style={{ justifySelf: "start" }}>{busy ? "Saving…" : "I finished this! (+10 FinCoins)"}</button>}
    </div>
  );
}

function Quiz({ item, onDone }: { item: any; onDone: () => void }) {
  const questions: { q: string; options: string[] }[] = item.quiz ?? [];
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [result, setResult] = useState<{ score: number; passed: boolean; results: boolean[] } | null>(null);
  const { busy, error, run } = useAction();

  if (!questions.length) return <p className="muted">This quiz isn't ready yet.</p>;

  const submit = () => run(async () => {
    if (answers.some((a) => a === null)) throw new Error("Answer every question first.");
    setResult(must(await supabase.rpc("submit_quiz", { p_item: item.id, p_answers: answers })));
    onDone();
  });
  const retry = () => { setResult(null); setAnswers(questions.map(() => null)); };

  return (
    <div>
      {questions.map((q, i) => (
        <fieldset key={i} className={`quiz-q ${result ? (result.results[i] ? "right" : "wrong") : ""}`} disabled={!!result}>
          <legend style={{ fontWeight: 800, padding: 0 }}>{i + 1}. {q.q}</legend>
          <div className="options">
            {q.options.map((o, j) => (
              <label key={j}>
                <input type="radio" name={`${item.id}-${i}`} checked={answers[i] === j} onChange={() => setAnswers(answers.map((a, k) => (k === i ? j : a)))} />
                {o}
              </label>
            ))}
          </div>
          {result && <p className="fine" style={{ margin: "6px 0 0" }}>{result.results[i] ? "✓ Correct!" : "✗ Not quite."}</p>}
        </fieldset>
      ))}
      <Notice kind="error">{error}</Notice>
      {result ? (
        <div className="stack">
          <Notice kind={result.passed ? "ok" : "info"}>
            You scored <strong>{result.score}%</strong>. {result.passed ? "Well done — you passed! 🎉" : "You need 60% to pass. Have another go!"}
          </Notice>
          <button className="btn white" onClick={retry} style={{ justifySelf: "start" }}>Try again</button>
        </div>
      ) : (
        <button className="btn" onClick={submit} disabled={busy}>{busy ? "Checking…" : "Check my answers"}</button>
      )}
    </div>
  );
}
