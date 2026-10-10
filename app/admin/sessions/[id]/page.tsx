"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead, statusChip } from "@/components/lms/ui";
import { when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useAction, useData } from "@/lib/lms/use-data";

type Mark = "present" | "late" | "absent";

// Attendance for one class (BAT-4). Until Zoom reports are connected, the admin marks it here.
export default function Attendance() {
  const { id } = useParams<{ id: string }>();
  const { data, error, reload } = useData(async () => {
    const session = must(await supabase.from("sessions").select("id, number, starts_at, status, batch_id, batches(id, name)").eq("id", id).single());
    const [roster, marks] = await Promise.all([
      supabase.from("enrolments").select("students(id, first_name, nickname)").eq("batch_id", session.batch_id).in("status", ["active", "completed"]).then(must),
      supabase.from("attendance").select("student_id, status").eq("session_id", id).then(must),
    ]);
    const students = roster.map((r: any) => r.students).sort((a: any, b: any) => a.first_name.localeCompare(b.first_name));
    return { session, students, marks };
  }, [id]);

  const [edits, setMarks] = useState<Record<string, Mark>>({});
  const marks: Record<string, Mark> = { ...Object.fromEntries((data?.marks ?? []).map((m: any) => [m.student_id, m.status])), ...edits };
  const { busy, error: saveError, run } = useAction();
  const [saved, setSaved] = useState(false);

  const save = () => run(async () => {
    const rows = data!.students.map((s: any) => ({ session_id: id, student_id: s.id, status: marks[s.id] ?? "absent", source: "manual" }));
    if (rows.length) must(await supabase.from("attendance").upsert(rows));
    must(await supabase.rpc("complete_session", { p_session: id }));
    setSaved(true);
    reload();
  });

  return (
    <Loaded data={data} error={error}>
      {(d) => {
        const s = d.session as any;
        return (
          <>
            <PageHead title={`Class ${s.number} · ${when(s.starts_at)}`} sub={<><Link href={`/admin/batches/${s.batches.id}`}>{s.batches.name}</Link> / Attendance</>}>
              {statusChip(s.status)}
            </PageHead>
            <div className="card">
              {d.students.length ? (
                <>
                  <div className="row" style={{ marginBottom: 12 }}>
                    <button className="btn white sm" onClick={() => setMarks(Object.fromEntries(d.students.map((x: any) => [x.id, "present"])))}>Everyone present</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Student</th><th>Present</th><th>Late</th><th>Absent</th></tr></thead>
                      <tbody>
                        {d.students.map((st: any) => (
                          <tr key={st.id}>
                            <td><strong>{st.first_name}</strong>{st.nickname && <span className="fine"> ({st.nickname})</span>}</td>
                            {(["present", "late", "absent"] as Mark[]).map((m) => (
                              <td key={m}>
                                <input type="radio" name={st.id} checked={(marks[st.id] ?? "absent") === m}
                                  onChange={() => { setSaved(false); setMarks({ ...marks, [st.id]: m }); }} aria-label={`${st.first_name} ${m}`} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="row end" style={{ marginTop: 14 }}>
                    <Notice kind="error">{saveError}</Notice>
                    {saved && <Notice kind="ok">Attendance saved — FinCoins and badges were updated.</Notice>}
                    <button className="btn" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save attendance"}</button>
                  </div>
                </>
              ) : <Empty>No students in this batch yet.</Empty>}
            </div>
          </>
        );
      }}
    </Loaded>
  );
}
