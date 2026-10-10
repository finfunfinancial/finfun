"use client";
import Link from "next/link";
import { Loaded, statusChip } from "@/components/ui";
import { day, when } from "@/lib/format";
import { must, supabase } from "@/lib/supabase";
import { useData } from "@/lib/use-data";

/** Everything a child has done: attendance, activities per module, FinCoins, badges, rubric, certificates.
 *  Used by the parent report; RLS lets parents and the student read exactly this. */
export async function loadProgress(studentId: string) {
  const [student, enrolments, attendance, progress, points, awards, badges, rubric, levels, skills, certificates] = await Promise.all([
    supabase.from("students").select("id, first_name, nickname, grade").eq("id", studentId).single().then(must),
    supabase.from("enrolments").select("id, status, program_id, programs(name), batch_id").eq("student_id", studentId).in("status", ["active", "completed", "waitlisted"]).then(must),
    supabase.from("attendance").select("status, sessions(number, starts_at, batch_id)").eq("student_id", studentId).then(must),
    supabase.from("progress").select("content_item_id, status, score").eq("student_id", studentId).then(must),
    supabase.from("points_ledger").select("points").eq("student_id", studentId).then(must),
    supabase.from("badge_awards").select("badge_id, awarded_at").eq("student_id", studentId).then(must),
    supabase.from("badges").select("id, name, image").order("name").then(must),
    supabase.from("rubric_scores").select("program_id, skill_id, stage, level").eq("student_id", studentId).then(must),
    supabase.from("rubric_levels").select("*").order("level").then(must),
    supabase.from("rubric_skills").select("*").order("id").then(must),
    supabase.from("certificates").select("id, program_id, issued_at, programs(name)").eq("student_id", studentId).then(must),
  ]);
  const programIds = enrolments.map((e: any) => e.program_id);
  const modules = programIds.length
    ? must(await supabase.from("modules").select("id, program_id, position, title, lessons(id, content_items(id, kind, language))").in("program_id", programIds).order("position"))
    : [];
  const done = new Set(progress.filter((p: any) => p.status === "done").map((p: any) => p.content_item_id));
  const moduleProgress = modules.map((m: any) => {
    const items = m.lessons.flatMap((l: any) => l.content_items).filter((c: any) => c.language === "en");
    return { ...m, total: items.length, done: items.filter((c: any) => done.has(c.id)).length };
  });
  const coins = points.reduce((s: number, p: any) => s + p.points, 0);
  return { student, enrolments, attendance, moduleProgress, coins, awards, badges, rubric, levels, skills, certificates };
}

export type Progress = Awaited<ReturnType<typeof loadProgress>>;

export function Badges({ badges, awards }: { badges: any[]; awards: any[] }) {
  const earned = new Set(awards.map((a) => a.badge_id));
  return (
    <div className="badges">
      {badges.map((b) => (
        <div key={b.id} className={earned.has(b.id) ? "badge" : "badge locked"} title={earned.has(b.id) ? "Earned!" : "Not yet"}>
          <img src={b.image} alt="" />
          {b.name}
        </div>
      ))}
    </div>
  );
}

export function ModuleBars({ modules }: { modules: any[] }) {
  return (
    <div className="stack" style={{ gap: 10 }}>
      {modules.map((m) => (
        <div key={m.id}>
          <div className="spread fine"><span>{m.title}</span><span>{m.done} / {m.total}</span></div>
          <div className="bar"><span style={{ width: `${m.total ? (100 * m.done) / m.total : 0}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function ProgressReport({ studentId }: { studentId: string }) {
  const { data, error } = useData(() => loadProgress(studentId), [studentId]);
  return (
    <Loaded data={data} error={error}>
      {(d) => {
        const attended = d.attendance.filter((a: any) => a.status !== "absent").length;
        return (
          <>
            <div className="stats">
              <div className="stat"><span className="stat-value">{attended}/{d.attendance.length}</span><span className="stat-label">Classes attended</span></div>
              <div className="stat"><span className="stat-value">{d.coins}</span><span className="stat-label">FinCoins</span></div>
              <div className="stat"><span className="stat-value">{d.awards.length}</span><span className="stat-label">Badges</span></div>
              <div className="stat"><span className="stat-value">{d.certificates.length}</span><span className="stat-label">Certificates</span></div>
            </div>
            <div className="split">
              <div>
                <section className="card">
                  <h2>Lessons done</h2>
                  {d.moduleProgress.length ? <ModuleBars modules={d.moduleProgress} /> : <p className="muted">Not enrolled in a program yet.</p>}
                </section>
                <section className="card">
                  <h2>Money skills (rubric)</h2>
                  {d.rubric.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Skill</th><th>At the start</th><th>At the end</th></tr></thead>
                        <tbody>
                          {d.skills.map((k: any) => {
                            const lvl = (stage: string) => d.levels.find((l: any) => l.level === d.rubric.find((r: any) => r.skill_id === k.id && r.stage === stage)?.level);
                            return (
                              <tr key={k.id}>
                                <td>{k.name}</td>
                                {["baseline", "endline"].map((st) => <td key={st}>{lvl(st) ? <>{lvl(st).name} <span className="fine">· {lvl(st).label}</span></> : "—"}</td>)}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="muted">The trainer records these at the start and end of the program.</p>}
                </section>
              </div>
              <div>
                <section className="card">
                  <h2>Badges</h2>
                  <Badges badges={d.badges} awards={d.awards} />
                </section>
                <section className="card">
                  <h2>Certificates</h2>
                  {d.certificates.length ? d.certificates.map((c: any) => (
                    <p key={c.id}><Link href={`/certificate/${c.id}`}>{c.programs.name}</Link> <span className="fine">· {day(c.issued_at)}</span></p>
                  )) : <p className="muted">Earned by attending 75% of classes and passing every quiz.</p>}
                </section>
                <section className="card">
                  <h2>Attendance</h2>
                  {d.attendance.length ? (
                    <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0, gap: 6 }}>
                      {d.attendance.sort((a: any, b: any) => a.sessions.starts_at.localeCompare(b.sessions.starts_at)).map((a: any, i: number) => (
                        <li key={i} className="spread"><span>{when(a.sessions.starts_at)}</span>{statusChip(a.status)}</li>
                      ))}
                    </ul>
                  ) : <p className="muted">No classes yet.</p>}
                </section>
              </div>
            </div>
          </>
        );
      }}
    </Loaded>
  );
}
