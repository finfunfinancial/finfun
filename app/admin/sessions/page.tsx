"use client";
import Link from "next/link";
import { useState } from "react";
import { Empty, Loaded, PageHead, statusChip } from "@/components/lms/ui";
import { when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";

type Range = "upcoming" | "past";

// Every live class across all batches: Zoom set up? attendance taken? recording uploaded?
export default function LiveSessions() {
  const [range, setRange] = useState<Range>("upcoming");
  const { data, error } = useData(async () => {
    const now = new Date().toISOString();
    let query = supabase.from("sessions")
      .select("id, number, starts_at, status, has_zoom, recording_path, batches(id, name, programs(name)), attendance(status)")
      .neq("status", "cancelled").limit(200);
    query = range === "upcoming" ? query.gte("starts_at", now).order("starts_at") : query.lt("starts_at", now).order("starts_at", { ascending: false });
    return query.then(must);
  }, [range]);

  return (
    <>
      <PageHead title="Live Sessions" sub="Every class across all batches. Set Zoom and upload recordings on the batch page.">
        <div className="tabs" style={{ width: 240, margin: 0 }}>
          <button aria-pressed={range === "upcoming"} onClick={() => setRange("upcoming")}>Upcoming</button>
          <button aria-pressed={range === "past"} onClick={() => setRange("past")}>Past</button>
        </div>
      </PageHead>
      <Loaded data={data} error={error}>
        {(rows) => rows.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>When</th><th>Batch</th><th>Course</th><th>Zoom</th>{range === "past" && <><th className="num">Attended</th><th>Recording</th></>}<th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((s: any) => {
                  const present = s.attendance.filter((a: any) => a.status !== "absent").length;
                  return (
                    <tr key={s.id}>
                      <td>{when(s.starts_at)}<br /><span className="fine">Class {s.number}</span></td>
                      <td><Link href={`/admin/batches/${s.batches.id}`}>{s.batches.name}</Link></td>
                      <td>{s.batches.programs.name}</td>
                      <td>{s.has_zoom ? "✓" : <span className="chip s-pending">not set</span>}</td>
                      {range === "past" && (
                        <>
                          <td className="num">{s.attendance.length ? `${present} / ${s.attendance.length}` : <span className="chip s-pending">not taken</span>}</td>
                          <td>{s.recording_path ? "✓" : <span className="muted">—</span>}</td>
                        </>
                      )}
                      <td>{statusChip(s.status)}</td>
                      <td className="num"><Link href={`/admin/sessions/${s.id}`}>Attendance</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty>No {range} classes.</Empty>}
      </Loaded>
    </>
  );
}
