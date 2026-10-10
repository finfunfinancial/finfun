"use client";
import { must, supabase } from "@/lib/lms/supabase";

/** Everything a learner has done: attendance, activities per module, FinCoins, badges, rubric, certificates.
 *  RLS lets only the learner's own account read this. */
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
