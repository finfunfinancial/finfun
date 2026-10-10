"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead, statusChip } from "@/components/ui";
import { useUser } from "@/lib/auth";
import { when } from "@/lib/format";
import { must, supabase } from "@/lib/supabase";
import { useData } from "@/lib/use-data";

type Stage = "baseline" | "endline";

// A trainer's batch: sessions, roster, and the rubric grid (RUB-2).
export default function TeachBatch() {
  const { id } = useParams<{ id: string }>();
  const me = useUser();
  const [stage, setStage] = useState<Stage>("baseline");
  const [saved, setSaved] = useState<string | null>(null);
  const { data, error, reload } = useData(async () => {
    const batch = must(await supabase.from("batches").select("id, name, program_id, programs(name)").eq("id", id).single());
    const [roster, sessions, skills, levels] = await Promise.all([
      supabase.from("enrolments").select("students(id, first_name, nickname)").eq("batch_id", id).in("status", ["active", "completed"]).then(must),
      supabase.from("sessions").select("id, number, starts_at, status").eq("batch_id", id).order("number").then(must),
      supabase.from("rubric_skills").select("*").order("id").then(must),
      supabase.from("rubric_levels").select("*").order("level").then(must),
    ]);
    const students = roster.map((r: any) => r.students).sort((a: any, b: any) => a.first_name.localeCompare(b.first_name));
    const scores = students.length
      ? must(await supabase.from("rubric_scores").select("student_id, skill_id, stage, level").eq("program_id", batch.program_id).in("student_id", students.map((s: any) => s.id)))
      : [];
    return { batch, students, sessions, skills, levels, scores };
  }, [id]);

  const setLevel = async (programId: string, studentId: string, skillId: number, level: string) => {
    if (!level) return; // levels are corrected by picking another, not cleared
    setSaved(null);
    const { error } = await supabase.from("rubric_scores").upsert({
      student_id: studentId, program_id: programId, skill_id: skillId, stage, level: Number(level), assessor_id: me.id, recorded_at: new Date().toISOString(),
    });
    if (error) return alert(error.message);
    setSaved("Saved.");
    reload();
  };

  return (
    <Loaded data={data} error={error}>
      {(d) => (
        <>
          <PageHead title={d.batch.name} sub={<><Link href="/teach">My classes</Link> / {(d.batch as any).programs.name}</>} />
          <section className="card">
            <h2>Sessions</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>When</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {d.sessions.map((s: any) => (
                    <tr key={s.id}>
                      <td>{s.number}</td>
                      <td>{when(s.starts_at)}</td>
                      <td>{statusChip(s.status)}</td>
                      <td className="num">{s.status !== "cancelled" && <Link href={`/teach/sessions/${s.id}`}>Attendance →</Link>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <div className="spread">
              <h2 style={{ margin: 0 }}>Rubric</h2>
              <div className="tabs" style={{ width: 280, margin: 0 }}>
                <button aria-pressed={stage === "baseline"} onClick={() => setStage("baseline")}>Start (baseline)</button>
                <button aria-pressed={stage === "endline"} onClick={() => setStage("endline")}>End (endline)</button>
              </div>
            </div>
            <p className="fine">Pick each student's level per skill. It saves straight away.</p>
            <Notice kind="ok">{saved}</Notice>
            {d.students.length ? (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Student</th>{d.skills.map((k: any) => <th key={k.id}>{k.name}</th>)}</tr></thead>
                  <tbody>
                    {d.students.map((s: any) => (
                      <tr key={s.id}>
                        <td><strong>{s.first_name}</strong></td>
                        {d.skills.map((k: any) => {
                          const cur = d.scores.find((x: any) => x.student_id === s.id && x.skill_id === k.id && x.stage === stage);
                          return (
                            <td key={k.id}>
                              <select value={cur?.level ?? ""} onChange={(e) => setLevel(d.batch.program_id, s.id, k.id, e.target.value)}
                                aria-label={`${s.first_name}: ${k.name}`} style={{ minHeight: 34 }}>
                                <option value="">—</option>
                                {d.levels.map((l: any) => <option key={l.level} value={l.level}>{l.name}</option>)}
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty>No students in this batch yet.</Empty>}
          </section>
        </>
      )}
    </Loaded>
  );
}
