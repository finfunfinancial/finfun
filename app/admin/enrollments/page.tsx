"use client";
import Link from "next/link";
import { useState } from "react";
import { Empty, Loaded, PageHead, statusChip } from "@/components/lms/ui";
import { downloadCsv, when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";

const STATUSES = ["all", "active", "pending", "waitlisted", "completed", "expired", "refunded"];

// Every enrollment (a child in a course), newest first, filterable by status.
export default function Enrollments() {
  const [status, setStatus] = useState("all");
  const { data, error } = useData(() => {
    let query = supabase.from("enrolments")
      .select("id, status, source, created_at, students(first_name, grade, guardian_links(profiles(email))), programs(name), batches(id, name), orders(amount_paise, status)")
      .order("created_at", { ascending: false }).limit(500);
    if (status !== "all") query = query.eq("status", status);
    return query.then(must);
  }, [status]);

  const exportCsv = (rows: any[]) => downloadCsv(`finfun-enrollments-${status}.csv`, rows.map((e) => ({
    date: e.created_at, student: e.students.first_name, grade: e.students.grade,
    parent: e.students.guardian_links.map((g: any) => g.profiles.email).join("; "),
    course: e.programs.name, batch: e.batches?.name ?? "", status: e.status, source: e.source,
  })));

  return (
    <>
      <PageHead title="Enrollments" sub="Each row is one child in one course.">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" style={{ width: 170 }}>
          {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        {data && data.length > 0 && <button className="btn white" onClick={() => exportCsv(data)}>Export CSV</button>}
      </PageHead>
      <Loaded data={data} error={error}>
        {(rows) => rows.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Student</th><th>Parent</th><th>Course</th><th>Batch</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((e: any) => (
                  <tr key={e.id}>
                    <td>{when(e.created_at)}</td>
                    <td><strong>{e.students.first_name}</strong> <span className="fine">· grade {e.students.grade}</span></td>
                    <td>{e.students.guardian_links.map((g: any) => g.profiles.email).join(", ") || <span className="muted">School</span>}</td>
                    <td>{e.programs.name}</td>
                    <td>{e.batches ? <Link href={`/admin/batches/${e.batches.id}`}>{e.batches.name}</Link> : <span className="muted">Not picked</span>}</td>
                    <td>
                      {statusChip(e.status)}
                      {e.status === "pending" && <> <Link href="/admin/orders" className="fine">Mark paid →</Link></>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No {status === "all" ? "" : `${status} `}enrollments.</Empty>}
      </Loaded>
    </>
  );
}
