"use client";
import Link from "next/link";
import { useState } from "react";
import { Empty, Loaded, PageHead, statusChip } from "@/components/lms/ui";
import { downloadCsv, when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";

// Every child learning with FinFun: their parent's account, courses and progress.
export default function Students() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const { data, error } = useData(() => {
    let query = supabase.from("students")
      .select("id, first_name, grade, created_at, guardian_links(profiles(email, full_name)), enrolments(id, status, programs(name), batches(id, name)), points_ledger(points), badge_awards(badge_id)")
      .order("created_at", { ascending: false }).limit(300);
    if (search) query = query.ilike("first_name", `%${search.replace(/[%_]/g, "")}%`);
    return query.then(must);
  }, [search]);

  const exportCsv = (rows: any[]) => downloadCsv("finfun-students.csv", rows.map((s) => ({
    joined: s.created_at, student: s.first_name, grade: s.grade,
    parent: s.guardian_links.map((g: any) => g.profiles.email).join("; "),
    courses: s.enrolments.map((e: any) => `${e.programs.name} (${e.status})`).join("; "),
    fincoins: s.points_ledger.reduce((t: number, p: any) => t + p.points, 0),
    badges: s.badge_awards.length,
  })));

  return (
    <>
      <PageHead title="Students" sub="Every child learning with FinFun, with their parent and courses.">
        <form className="row" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by first name…" aria-label="Search students" style={{ width: 220 }} />
          <button className="btn white">Search</button>
        </form>
        {data && data.length > 0 && <button className="btn white" onClick={() => exportCsv(data)}>Export CSV</button>}
      </PageHead>
      <Loaded data={data} error={error}>
        {(rows) => rows.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Grade</th><th>Parent</th><th>Courses</th><th className="num">FinCoins</th><th className="num">Badges</th><th>Joined</th></tr></thead>
              <tbody>
                {rows.map((s: any) => (
                  <tr key={s.id}>
                    <td><strong>{s.first_name}</strong></td>
                    <td>{s.grade}</td>
                    <td>{s.guardian_links.map((g: any) => g.profiles.full_name || g.profiles.email).join(", ") || "School"}</td>
                    <td>
                      {s.enrolments.map((e: any) => (
                        <div key={e.id}>{e.programs.name}{e.batches && <> · <Link href={`/admin/batches/${e.batches.id}`}>{e.batches.name}</Link></>} {statusChip(e.status)}</div>
                      ))}
                      {!s.enrolments.length && <span className="muted">None</span>}
                    </td>
                    <td className="num">{s.points_ledger.reduce((t: number, p: any) => t + p.points, 0)}</td>
                    <td className="num">{s.badge_awards.length}</td>
                    <td>{when(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No students found.</Empty>}
      </Loaded>
    </>
  );
}
