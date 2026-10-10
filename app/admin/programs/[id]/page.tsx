"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead } from "@/components/lms/ui";
import { must, supabase } from "@/lib/lms/supabase";
import { useAction, useData } from "@/lib/lms/use-data";

const KINDS = { slides: "Slides", video: "Video", pdf: "PDF / worksheet", quiz: "Quiz", game: "Game", activity: "Activity" };
const LANGS = { en: "English", hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil" };

// Curriculum editor (CAT-2, CAT-3): modules → lessons → activities.
export default function Curriculum() {
  const { id } = useParams<{ id: string }>();
  const { data, error, reload } = useData(async () => {
    const program = must(await supabase.from("programs").select("id, name, slug, modules(id, position, title, lessons(id, position, title, content_items(*)))")
      .eq("id", id).order("position", { referencedTable: "modules" }).single());
    const itemIds = program.modules.flatMap((m: any) => m.lessons.flatMap((l: any) => l.content_items.map((c: any) => c.id)));
    const keys = itemIds.length ? must(await supabase.from("quiz_keys").select("*").in("content_item_id", itemIds)) : [];
    return { program, keys: Object.fromEntries(keys.map((k: any) => [k.content_item_id, k.answers])) as Record<string, number[]> };
  }, [id]);

  return (
    <Loaded data={data} error={error}>
      {({ program, keys }) => (
        <>
          <PageHead title={program.name} sub={<><Link href="/admin/programs">Programs</Link> / Curriculum</>} />
          {program.modules.length ? program.modules.map((m: any) => <Module key={m.id} m={m} keys={keys} slug={program.slug} onChange={reload} />)
            : <Empty>No modules yet. Add the first one below.</Empty>}
          <AddRow
            label="Add module"
            onAdd={async (title) => must(await supabase.from("modules").insert({ program_id: program.id, title, position: nextPos(program.modules) }))}
            onDone={reload}
          />
        </>
      )}
    </Loaded>
  );
}

const nextPos = (rows: { position: number }[]) => Math.max(0, ...rows.map((r) => r.position)) + 1;
const byPos = (a: { position: number }, b: { position: number }) => a.position - b.position;

function Module({ m, keys, slug, onChange }: { m: any; keys: Record<string, number[]>; slug: string; onChange: () => void }) {
  return (
    <section className="card">
      <div className="spread">
        <Rename table="modules" row={m} label={`Module ${m.position}`} onDone={onChange} />
        <Delete table="modules" id={m.id} what="this module, its lessons and activities" onDone={onChange} />
      </div>
      {[...m.lessons].sort(byPos).map((l: any) => (
        <div key={l.id} style={{ borderTop: "1px solid var(--line-soft)", marginTop: 14, paddingTop: 14 }}>
          <div className="spread">
            <Rename table="lessons" row={l} label={`Lesson ${m.position}.${l.position}`} onDone={onChange} />
            <Delete table="lessons" id={l.id} what="this lesson and its activities" onDone={onChange} />
          </div>
          <div className="table-wrap" style={{ margin: "10px 0" }}>
            <table>
              <tbody>
                {[...l.content_items].sort(byPos).map((c: any) => <Item key={c.id} c={c} answers={keys[c.id]} onChange={onChange} />)}
                {!l.content_items.length && <tr><td className="muted">No activities yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <AddItem lessonId={l.id} position={nextPos(l.content_items)} slug={slug} onDone={onChange} />
        </div>
      ))}
      <AddRow
        label="Add lesson"
        onAdd={async (title) => must(await supabase.from("lessons").insert({ module_id: m.id, title, position: nextPos(m.lessons) }))}
        onDone={onChange}
      />
    </section>
  );
}

function Item({ c, answers, onChange }: { c: any; answers?: number[]; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <tr>
        <td style={{ width: 120 }}><span className="chip">{KINDS[c.kind as keyof typeof KINDS]}</span></td>
        <td>
          <strong>{c.title}</strong>
          {c.language !== "en" && <span className="fine"> · {LANGS[c.language as keyof typeof LANGS]}</span>}
          <br />
          <span className="fine">
            {c.kind === "quiz"
              ? `${c.quiz?.length ?? 0} questions${answers ? "" : " · no answer key!"}`
              : c.asset_path ?? "No file or link"}
            {c.duration_min ? ` · ${c.duration_min} min` : ""}
          </span>
        </td>
        <td className="num" style={{ whiteSpace: "nowrap" }}>
          {c.kind === "quiz" && <button className="btn white sm" onClick={() => setEditing(!editing)}>{editing ? "Close" : "Edit quiz"}</button>}{" "}
          <Delete table="content_items" id={c.id} what={`"${c.title}"`} onDone={onChange} />
        </td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={3}><QuizEditor item={c} answers={answers} onSaved={() => { setEditing(false); onChange(); }} /></td>
        </tr>
      )}
    </>
  );
}

// Quiz text format — one block per question, blank line between questions:
//   What should you never share?
//   * Your OTP          ← the right answer starts with *
//   - Your favourite colour
const toText = (quiz: { q: string; options: string[] }[] | null, answers?: number[]) =>
  (quiz ?? []).map((q, i) => [q.q, ...q.options.map((o, j) => `${answers?.[i] === j ? "*" : "-"} ${o}`)].join("\n")).join("\n\n");

function parseQuiz(text: string) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean)).filter((b) => b.length);
  if (!blocks.length) throw new Error("Write at least one question.");
  const quiz: { q: string; options: string[] }[] = [];
  const answers: number[] = [];
  blocks.forEach(([q, ...opts], i) => {
    if (opts.length < 2) throw new Error(`Question ${i + 1} needs at least 2 options (lines starting with * or -).`);
    const right = opts.filter((o) => o.startsWith("*"));
    if (right.length !== 1) throw new Error(`Question ${i + 1} needs exactly one right answer marked with *.`);
    quiz.push({ q, options: opts.map((o) => o.replace(/^[*-]\s*/, "")) });
    answers.push(opts.findIndex((o) => o.startsWith("*")));
  });
  return { quiz, answers };
}

function QuizEditor({ item, answers, onSaved }: { item: any; answers?: number[]; onSaved: () => void }) {
  const [text, setText] = useState(toText(item.quiz, answers));
  const { busy, error, run } = useAction();
  const save = () =>
    run(async () => {
      const { quiz, answers } = parseQuiz(text);
      must(await supabase.from("content_items").update({ quiz }).eq("id", item.id));
      must(await supabase.from("quiz_keys").upsert({ content_item_id: item.id, answers }));
      onSaved();
    });
  return (
    <div className="stack">
      <p className="fine" style={{ margin: 0 }}>
        One question per block, a blank line between questions. Start the right answer with <strong>*</strong> and the others with <strong>-</strong>. Students need 60% to pass.
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} style={{ fontFamily: "ui-monospace, monospace" }}
        placeholder={"What should you never share?\n* Your OTP\n- Your favourite colour\n- Your school name"} />
      <Notice kind="error">{error}</Notice>
      <div className="row end"><button className="btn" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save quiz"}</button></div>
    </div>
  );
}

function AddItem({ lessonId, position, slug, onDone }: { lessonId: string; position: number; slug: string; onDone: () => void }) {
  const [kind, setKind] = useState("slides");
  const { busy, error, run } = useAction();
  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      let asset = String(f.get("link") ?? "").trim() || null;
      const file = f.get("file") as File | null;
      if (file?.size) {
        const path = `${slug}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        must(await supabase.storage.from("content").upload(path, file));
        asset = path;
      }
      if (asset && !asset.startsWith("https://") && !file?.size) throw new Error("Links must start with https://");
      must(await supabase.from("content_items").insert({
        lesson_id: lessonId,
        position,
        kind,
        title: String(f.get("title")).trim(),
        language: f.get("language"),
        duration_min: Number(f.get("duration")) || null,
        asset_path: kind === "quiz" ? null : asset,
        quiz: kind === "quiz" ? [] : null,
      }));
      form.reset();
      setKind("slides");
      onDone();
    });
  };
  return (
    <details className="panel" style={{ marginBottom: 0 }}>
      <summary>Add activity</summary>
      <div>
        <form className="stack" onSubmit={add}>
          <div className="fields">
            <label>Type
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Title<input name="title" required /></label>
            <label>Language
              <select name="language" defaultValue="en">
                {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Minutes<input name="duration" type="number" min={1} max={180} /></label>
          </div>
          {kind === "quiz" ? (
            <p className="fine" style={{ margin: 0 }}>Add the quiz, then click “Edit quiz” to write its questions.</p>
          ) : (
            <div className="fields">
              <label>Upload a file<input name="file" type="file" /></label>
              <label>…or paste a link<input name="link" type="url" placeholder="https://youtube.com/… or a game URL" /></label>
            </div>
          )}
          <Notice kind="error">{error}</Notice>
          <div className="row end"><button className="btn" disabled={busy}>{busy ? "Adding…" : "Add activity"}</button></div>
        </form>
      </div>
    </details>
  );
}

function AddRow({ label, onAdd, onDone }: { label: string; onAdd: (title: string) => Promise<unknown>; onDone: () => void }) {
  const { busy, error, run } = useAction();
  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = String(new FormData(form).get("title")).trim();
    run(async () => {
      await onAdd(title);
      form.reset();
      onDone();
    });
  };
  return (
    <form className="row" onSubmit={add} style={{ marginTop: 14 }}>
      <input name="title" placeholder={label + " title"} required style={{ flex: 1, minWidth: 200 }} />
      <button className="btn white" disabled={busy}>{label}</button>
      <Notice kind="error">{error}</Notice>
    </form>
  );
}

function Rename({ table, row, label, onDone }: { table: string; row: { id: string; title: string }; label: string; onDone: () => void }) {
  const [title, setTitle] = useState(row.title);
  const save = async () => {
    if (title.trim() && title !== row.title) {
      await supabase.from(table).update({ title: title.trim() }).eq("id", row.id);
      onDone();
    }
  };
  return (
    <label className="row" style={{ flex: 1, fontWeight: 800 }}>
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={save} style={{ flex: 1, minWidth: 180 }} aria-label={`${label} title`} />
    </label>
  );
}

function Delete({ table, id, what, onDone }: { table: string; id: string; what: string; onDone: () => void }) {
  const remove = async () => {
    if (!confirm(`Delete ${what}? Students' progress on it is deleted too.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert(error.message);
    onDone();
  };
  return <button className="btn danger sm" onClick={remove}>Delete</button>;
}
