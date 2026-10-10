"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead, statusChip } from "@/components/ui";
import { clock, weekdays, when } from "@/lib/format";
import { must, supabase } from "@/lib/supabase";
import { useAction, useData } from "@/lib/use-data";

export default function Batch() {
  const { id } = useParams<{ id: string }>();
  const { data, error, reload } = useData(async () => {
    const batch = must(await supabase.from("batches").select("*, programs(id, name), sections(id, name, organisations(name))").eq("id", id).single());
    const [roster, sessions, trainers, others] = await Promise.all([
      supabase.from("enrolments").select("id, status, source, students(id, first_name, username, grade)").eq("batch_id", id)
        .in("status", ["active", "waitlisted", "completed"]).order("status").then(must),
      supabase.from("sessions").select("id, number, starts_at, status, has_zoom, recording_path").eq("batch_id", id).order("number").then(must),
      supabase.from("profiles").select("id, full_name, email").in("role", ["trainer", "admin"]).order("full_name").then(must),
      supabase.from("batches").select("id, name").eq("program_id", batch.program_id).neq("id", id).in("status", ["open", "running"]).then(must),
    ]);
    const attendance = sessions.length
      ? must(await supabase.from("attendance").select("student_id, session_id, status").in("session_id", sessions.map((s: any) => s.id)))
      : [];
    return { batch, roster, sessions, trainers, others, attendance };
  }, [id]);

  return (
    <Loaded data={data} error={error}>
      {(d) => {
        const held = d.sessions.filter((s: any) => s.status === "completed").length;
        const attended = (sid: string) => d.attendance.filter((a: any) => a.student_id === sid && a.status !== "absent").length;
        return (
          <>
            <PageHead
              title={d.batch.name}
              sub={<><Link href="/admin/batches">Batches</Link> / {d.batch.programs.name} · {weekdays[d.batch.weekday]}s {clock(d.batch.start_time)} IST{d.batch.sections ? ` · ${d.batch.sections.organisations?.name} ${d.batch.sections.name}` : ""}</>}
            >
              {statusChip(d.batch.status)}
            </PageHead>

            <div className="split">
              <div>
                <section className="card">
                  <div className="spread">
                    <h2 style={{ margin: 0 }}>Students ({d.roster.filter((r: any) => r.status === "active").length} / {d.batch.seat_limit})</h2>
                    <IssueCertificates batchId={id} onDone={reload} />
                  </div>
                  {d.roster.length ? (
                    <div className="table-wrap" style={{ marginTop: 12 }}>
                      <table>
                        <thead><tr><th>Student</th><th>Grade</th><th className="num">Attended</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                          {d.roster.map((e: any) => (
                            <tr key={e.id}>
                              <td><strong>{e.students.first_name}</strong><br /><span className="fine">{e.students.username}</span></td>
                              <td>{e.students.grade}</td>
                              <td className="num">{attended(e.students.id)} / {held}</td>
                              <td>{statusChip(e.status)}</td>
                              <td className="num"><RosterActions e={e} others={d.others} onDone={reload} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <Empty>No students yet.</Empty>}
                  <AddStudent batch={d.batch} onDone={reload} />
                </section>

                <section className="card">
                  <h2>Sessions</h2>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>#</th><th>When</th><th>Zoom</th><th>Recording</th><th>Status</th><th></th></tr></thead>
                      <tbody>{d.sessions.map((s: any) => <SessionRow key={s.id} s={s} onDone={reload} />)}</tbody>
                    </table>
                  </div>
                </section>
              </div>

              <BatchSettings batch={d.batch} trainers={d.trainers} onSaved={reload} />
            </div>
          </>
        );
      }}
    </Loaded>
  );
}

function BatchSettings({ batch, trainers, onSaved }: { batch: any; trainers: any[]; onSaved: () => void }) {
  const { busy, error, run } = useAction();
  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(async () => {
      must(await supabase.from("batches").update({
        name: String(f.get("name")).trim(),
        trainer_id: f.get("trainer") || null,
        seat_limit: Number(f.get("seats")),
        status: f.get("status"),
      }).eq("id", batch.id));
      onSaved();
    });
  };
  return (
    <form className="card stack" onSubmit={save}>
      <h2 style={{ margin: 0 }}>Settings</h2>
      <label>Name<input name="name" defaultValue={batch.name} required /></label>
      <label>Trainer
        <select name="trainer" defaultValue={batch.trainer_id ?? ""}>
          <option value="">None yet</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.full_name ?? t.email}</option>)}
        </select>
      </label>
      <label>Seats<input name="seats" type="number" min={1} max={500} defaultValue={batch.seat_limit} required /></label>
      <label>Status
        <select name="status" defaultValue={batch.status}>
          <option value="open">Open — parents can pick it</option>
          <option value="running">Running — no new students</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <Notice kind="error">{error}</Notice>
      <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
    </form>
  );
}

function RosterActions({ e, others, onDone }: { e: any; others: any[]; onDone: () => void }) {
  const update = async (patch: object, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    const { error } = await supabase.from("enrolments").update(patch).eq("id", e.id);
    if (error) alert(error.message);
    onDone();
  };
  return (
    <div className="row end">
      {e.status === "waitlisted" && <button className="btn sm" onClick={() => update({ status: "active" })}>Give seat</button>}
      {others.length > 0 && e.status !== "completed" && (
        <select aria-label="Move to batch" value="" onChange={(ev) => ev.target.value && update({ batch_id: ev.target.value, status: "active" }, "Move this student to the other batch?")} style={{ width: "auto", minHeight: 32 }}>
          <option value="">Move to…</option>
          {others.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      )}
    </div>
  );
}

function AddStudent({ batch, onDone }: { batch: any; onDone: () => void }) {
  const { busy, error, run, setError } = useAction();
  const [note, setNote] = useState<string | null>(null);
  const add = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const username = String(new FormData(form).get("username")).trim().toLowerCase();
    setNote(null);
    run(async () => {
      const s = must(await supabase.from("students").select("id, first_name").eq("username", username).maybeSingle());
      if (!s) throw new Error(`No student with username “${username}”.`);
      const open = must(await supabase.from("enrolments").select("id, status").eq("student_id", s.id).eq("program_id", batch.program_id)
        .in("status", ["pending", "active", "waitlisted"]).maybeSingle());
      if (open) must(await supabase.from("enrolments").update({ batch_id: batch.id, status: "active", expires_at: null }).eq("id", open.id));
      else must(await supabase.from("enrolments").insert({ student_id: s.id, program_id: batch.program_id, batch_id: batch.id, status: "active", source: batch.section_id ? "school" : "b2c" }));
      form.reset();
      setNote(`${s.first_name} added${open?.status === "pending" ? " (their unpaid enrolment was activated — record the payment in Orders)" : ""}.`);
      onDone();
    });
  };
  const addSection = () =>
    run(async () => {
      if (!confirm("Enrol every student in this school section into this batch?")) return;
      const students = must(await supabase.from("students").select("id").eq("section_id", batch.section_id));
      if (!students.length) return setError("That section has no students yet — import them on the Schools page.");
      const already = must(await supabase.from("enrolments").select("student_id").eq("program_id", batch.program_id)
        .in("student_id", students.map((s: any) => s.id)).in("status", ["pending", "active", "waitlisted"]));
      const taken = new Set(already.map((e: any) => e.student_id));
      const fresh = students.filter((s: any) => !taken.has(s.id));
      if (fresh.length) {
        must(await supabase.from("enrolments").insert(
          fresh.map((s: any) => ({ student_id: s.id, program_id: batch.program_id, batch_id: batch.id, status: "active", source: "school" })),
        ));
      }
      setNote(`${fresh.length} students enrolled${taken.size ? ` (${taken.size} were already enrolled)` : ""}.`);
      onDone();
    });
  return (
    <div className="stack" style={{ marginTop: 14 }}>
      <form className="row" onSubmit={add}>
        <input name="username" placeholder="Student username, e.g. aarav4821" required style={{ flex: 1, minWidth: 200 }} />
        <button className="btn white" disabled={busy}>Add student</button>
        {batch.section_id && <button type="button" className="btn white" onClick={addSection} disabled={busy}>Enrol whole section</button>}
      </form>
      <Notice kind="error">{error}</Notice>
      <Notice kind="ok">{note}</Notice>
    </div>
  );
}

function SessionRow({ s, onDone }: { s: any; onDone: () => void }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const { busy, error, run } = useAction();
  const setStatus = (status: string) => run(async () => {
    must(await supabase.from("sessions").update({ status }).eq("id", s.id));
    onDone();
  });
  const saveZoom = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    run(async () => {
      const meeting = String(f.get("meeting")).replace(/\D/g, "");
      if (meeting.length < 9) throw new Error("Zoom meeting IDs have 9–11 digits.");
      must(await supabase.from("sessions").update({ zoom_meeting_id: meeting, zoom_passcode: String(f.get("passcode")).trim() || null }).eq("id", s.id));
      setZoomOpen(false);
      onDone();
    });
  };
  const upload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    run(async () => {
      const path = `${s.id}/${file.name.replace(/[^\w.-]/g, "_")}`;
      must(await supabase.storage.from("recordings").upload(path, file, { upsert: true }));
      must(await supabase.from("sessions").update({ recording_path: path }).eq("id", s.id));
      onDone();
    });
  };
  return (
    <>
      <tr>
        <td>{s.number}</td>
        <td>{when(s.starts_at)}</td>
        <td><button className="link" onClick={() => setZoomOpen(!zoomOpen)}>{s.has_zoom ? "✓ change" : "Set meeting"}</button></td>
        <td>
          {s.recording_path ? "✓" : (
            <label className="link" style={{ display: "inline", fontWeight: 400 }}>Upload<input type="file" accept="video/*" onChange={upload} hidden /></label>
          )}
        </td>
        <td>{statusChip(s.status)}</td>
        <td className="num">
          {s.status === "cancelled"
            ? <button className="btn white sm" onClick={() => setStatus("scheduled")} disabled={busy}>Restore</button>
            : s.status === "scheduled" && <button className="btn danger sm" onClick={() => setStatus("cancelled")} disabled={busy}>Cancel</button>}
        </td>
      </tr>
      {(zoomOpen || error) && (
        <tr>
          <td colSpan={6}>
            {zoomOpen && (
              <form className="row" onSubmit={saveZoom}>
                <input name="meeting" placeholder="Zoom meeting ID" required style={{ width: 200 }} />
                <input name="passcode" placeholder="Passcode" style={{ width: 160 }} />
                <button className="btn sm" disabled={busy}>Save</button>
                <span className="fine">Until Zoom is connected, create the meeting in Zoom and paste its ID here.</span>
              </form>
            )}
            <Notice kind="error">{error}</Notice>
          </td>
        </tr>
      )}
    </>
  );
}

function IssueCertificates({ batchId, onDone }: { batchId: string; onDone: () => void }) {
  const { busy, run } = useAction();
  const issue = () => run(async () => {
    if (!confirm("Issue certificates to every student who attended 75%+ of this batch's classes (cancelled ones don't count) and passed every quiz? Usually done after the last class.")) return;
    const n = must(await supabase.rpc("issue_certificates", { p_batch: batchId }));
    alert(n ? `${n} certificate(s) issued.` : "No new certificates — nobody else has met the rule yet.");
    onDone();
  });
  return <button className="btn white sm" onClick={issue} disabled={busy}>Issue certificates</button>;
}
