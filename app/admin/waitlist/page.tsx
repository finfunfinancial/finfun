"use client";
import Link from "next/link";
import { Empty, Loaded, PageHead } from "@/components/lms/ui";
import { when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";

// Who's waiting: children on a full batch's waitlist, and paid children who haven't picked a batch yet.
export default function Waitlist() {
  const { data, error, reload } = useData(async () => {
    const [waiting, unplaced] = await Promise.all([
      supabase.from("enrolments")
        .select("id, created_at, students(first_name, grade, guardian_links(profiles(email))), programs(name), batches(id, name)")
        .eq("status", "waitlisted").order("created_at").then(must),
      supabase.from("enrolments")
        .select("id, created_at, students(first_name, grade, guardian_links(profiles(email))), programs(name)")
        .eq("status", "active").is("batch_id", null).order("created_at").then(must),
    ]);
    return { waiting, unplaced };
  });

  const giveSeat = async (id: string, name: string) => {
    if (!confirm(`Give ${name} a seat? The batch may go over its seat limit.`)) return;
    const { error } = await supabase.from("enrolments").update({ status: "active" }).eq("id", id);
    if (error) alert(error.message);
    reload();
  };

  const parent = (e: any) => e.students.guardian_links.map((g: any) => g.profiles.email).join(", ");

  return (
    <>
      <PageHead title="Waitlist" sub="Children waiting for a seat, and paid children who haven’t picked a class time yet." />
      <Loaded data={data} error={error}>
        {(d) => (
          <>
            <section className="card">
              <h2>Waiting for a seat ({d.waiting.length})</h2>
              {d.waiting.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Since</th><th>Student</th><th>Parent</th><th>Course</th><th>Batch</th><th></th></tr></thead>
                    <tbody>
                      {d.waiting.map((e: any) => (
                        <tr key={e.id}>
                          <td>{when(e.created_at)}</td>
                          <td><strong>{e.students.first_name}</strong> <span className="fine">· grade {e.students.grade}</span></td>
                          <td>{parent(e)}</td>
                          <td>{e.programs.name}</td>
                          <td>{e.batches && <Link href={`/admin/batches/${e.batches.id}`}>{e.batches.name}</Link>}</td>
                          <td className="num"><button className="btn sm" onClick={() => giveSeat(e.id, e.students.first_name)}>Give seat</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <Empty>Nobody is waiting for a seat.</Empty>}
            </section>

            <section className="card">
              <h2>Paid, no class time yet ({d.unplaced.length})</h2>
              <p className="fine">Parents pick a class time on My courses. If there’s no open batch for their course, <Link href="/admin/batches">create one</Link>.</p>
              {d.unplaced.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Paid on</th><th>Student</th><th>Parent</th><th>Course</th></tr></thead>
                    <tbody>
                      {d.unplaced.map((e: any) => (
                        <tr key={e.id}>
                          <td>{when(e.created_at)}</td>
                          <td><strong>{e.students.first_name}</strong> <span className="fine">· grade {e.students.grade}</span></td>
                          <td>{parent(e)}</td>
                          <td>{e.programs.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <Empty>Everyone who paid has a class time.</Empty>}
            </section>
          </>
        )}
      </Loaded>
    </>
  );
}
