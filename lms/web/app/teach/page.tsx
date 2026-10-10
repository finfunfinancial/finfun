"use client";
import Link from "next/link";
import { Empty, Loaded, PageHead, statusChip } from "@/components/ui";
import { useUser } from "@/lib/auth";
import { clock, weekdays, when } from "@/lib/format";
import { must, supabase } from "@/lib/supabase";
import { myBatchIds } from "@/lib/teaching";
import { useData } from "@/lib/use-data";

// Trainer / teacher home: upcoming classes and their batches.
export default function MyClasses() {
  const me = useUser();
  const { data, error } = useData(async () => {
    const ids = await myBatchIds(me);
    if (!ids.length) return { batches: [], upcoming: [] };
    const [batches, upcoming] = await Promise.all([
      supabase.from("batches").select("id, name, weekday, start_time, status, programs(name), sections(name, organisations(name)), enrolments(count)")
        .in("id", ids).eq("enrolments.status", "active").order("start_date", { ascending: false }).then(must),
      supabase.from("sessions").select("id, number, starts_at, status, batches(name)").in("batch_id", ids)
        .gte("starts_at", new Date(Date.now() - 3 * 3600e3).toISOString()).neq("status", "cancelled").order("starts_at").limit(8).then(must),
    ]);
    return { batches, upcoming };
  }, [me.id]);

  return (
    <>
      <PageHead title="My classes" sub="Mark attendance after each class, and record rubric levels at the start and end of the program." />
      <Loaded data={data} error={error}>
        {(d) => !d.batches.length ? <Empty>No batches assigned to you yet. Ask the FinFun team to add you as a trainer.</Empty> : (
          <div className="split">
            <section className="card">
              <h2>Coming up</h2>
              {d.upcoming.length ? (
                <ul className="lesson-list">
                  {d.upcoming.map((s: any) => (
                    <li key={s.id}>
                      <Link href={`/teach/sessions/${s.id}`}>
                        <span>{when(s.starts_at)}<br /><span className="fine">{s.batches.name} · class {s.number}</span></span>
                        <span>Attendance →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : <Empty>No upcoming classes.</Empty>}
            </section>
            <section className="card">
              <h2>Batches</h2>
              <ul className="lesson-list">
                {d.batches.map((b: any) => (
                  <li key={b.id}>
                    <Link href={`/teach/batches/${b.id}`}>
                      <span>{b.name}<br /><span className="fine">{b.programs.name} · {weekdays[b.weekday].slice(0, 3)} {clock(b.start_time)} · {b.enrolments[0]?.count ?? 0} students</span></span>
                      {statusChip(b.status)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </Loaded>
    </>
  );
}
