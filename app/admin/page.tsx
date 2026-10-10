"use client";
import Link from "next/link";
import { Empty, Loaded, PageHead, Stat, statusChip } from "@/components/lms/ui";
import { day, inr, istMidnight, istToday, when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";

const count = (q: PromiseLike<{ count: number | null }>) => Promise.resolve(q).then((r) => r.count ?? 0);
const enrolments = () => supabase.from("enrolments").select("id", { count: "exact", head: true });

// Ops dashboard (ADM-2): what needs attention today.
export default function Dashboard() {
  const { data, error } = useData(async () => {
    const today = istToday();
    const weekAhead = new Date(Date.now() + 7 * 86400e3).toISOString();
    const [newToday, unpaid, waitlisted, active, paid, sessions, batches, recent] = await Promise.all([
      count(enrolments().gte("created_at", istMidnight(today))),
      count(enrolments().eq("status", "pending")),
      count(enrolments().eq("status", "waitlisted")),
      count(enrolments().eq("status", "active")),
      supabase.from("orders").select("amount_paise").eq("status", "paid").gte("paid_at", istMidnight(today.slice(0, 8) + "01")).then(must),
      supabase.from("sessions").select("id, number, starts_at, status, has_zoom, batches(id, name)")
        .gte("starts_at", new Date().toISOString()).lte("starts_at", weekAhead).neq("status", "cancelled").order("starts_at").then(must),
      supabase.from("batches").select("id, name, seat_limit, enrolments(count)").eq("status", "open").eq("enrolments.status", "active").then(must),
      supabase.from("enrolments").select("id, status, created_at, students(first_name, username), programs(name)")
        .order("created_at", { ascending: false }).limit(8).then(must),
    ]);
    const revenue = paid.reduce((sum: number, o: { amount_paise: number }) => sum + o.amount_paise, 0);
    const full = batches.filter((b: any) => (b.enrolments[0]?.count ?? 0) >= b.seat_limit * 0.8);
    const needsWork = sessions.filter((s: any) => !s.has_zoom);
    return { newToday, unpaid, waitlisted, active, revenue, full, sessions, needsWork, recent };
  });

  return (
    <>
      <PageHead title="Dashboard" sub={`Today is ${day(new Date().toISOString())}`} />
      <Loaded data={data} error={error}>
        {(d) => (
          <>
            <div className="stats">
              <Stat label="Enrolments today" value={d.newToday} />
              <Stat label="Active students" value={d.active} />
              <Stat label="Revenue this month" value={inr(d.revenue)} />
              <Stat label="Unpaid enrolments" value={<Link href="/admin/orders">{d.unpaid}</Link>} warn={d.unpaid > 0} />
              <Stat label="Waitlisted" value={d.waitlisted} warn={d.waitlisted > 0} />
              <Stat label="Batches 80%+ full" value={d.full.length} warn={d.full.length > 0} />
            </div>

            <div className="split">
              <section className="card">
                <h2>Classes in the next 7 days</h2>
                {d.sessions.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>When</th><th>Batch</th><th>Zoom</th></tr></thead>
                      <tbody>
                        {d.sessions.map((s: any) => (
                          <tr key={s.id}>
                            <td>{when(s.starts_at)}</td>
                            <td><Link href={`/admin/batches/${s.batches.id}`}>{s.batches.name}</Link> · #{s.number}</td>
                            <td>{s.has_zoom ? "✓" : <span className="chip s-pending">not set</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <Empty>No classes this week.</Empty>}
                {d.needsWork.length > 0 && <p className="fine" style={{ marginTop: 10 }}>{d.needsWork.length} class(es) still need a Zoom meeting.</p>}
              </section>

              <section className="card">
                <h2>Latest enrolments</h2>
                {d.recent.length ? (
                  <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {d.recent.map((e: any) => (
                      <li key={e.id} className="spread">
                        <span><strong>{e.students?.first_name}</strong> · {e.programs?.name}<br /><span className="fine">{when(e.created_at)}</span></span>
                        {statusChip(e.status)}
                      </li>
                    ))}
                  </ul>
                ) : <Empty>No enrolments yet.</Empty>}
              </section>
            </div>
          </>
        )}
      </Loaded>
    </>
  );
}
