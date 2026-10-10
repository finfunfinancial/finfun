"use client";
import { Empty, Loaded, PageHead } from "@/components/lms/ui";
import { when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";

// Audit log (ADM-4): every change to children, consents, enrolments and orders.
export default function Audit() {
  const { data, error } = useData(async () => {
    const rows = must(await supabase.from("audit_log").select("*").order("at", { ascending: false }).limit(200));
    const ids = [...new Set(rows.map((r: any) => r.actor_id).filter(Boolean))];
    const actors = ids.length ? must(await supabase.from("profiles").select("id, full_name, email, phone, role").in("id", ids)) : [];
    return { rows, actors: Object.fromEntries(actors.map((a: any) => [a.id, a])) };
  });
  return (
    <>
      <PageHead title="Audit log" sub="Latest 200 changes. “System” means the change came from the backend (enrolment, payment, login setup)." />
      <Loaded data={data} error={error}>
        {({ rows, actors }) => rows.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>When</th><th>Who</th><th>What</th><th>Details</th></tr></thead>
              <tbody>
                {rows.map((r: any) => {
                  const a = actors[r.actor_id];
                  const changed = r.before && r.after
                    ? Object.keys(r.after).filter((k) => JSON.stringify(r.after[k]) !== JSON.stringify(r.before[k])).map((k) => `${k}: ${r.before[k]} → ${r.after[k]}`)
                    : [];
                  return (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{when(r.at)}</td>
                      <td>{a ? (a.full_name ?? a.email ?? a.phone) : "System"}</td>
                      <td>{r.action} {r.entity.replace("_", " ")}</td>
                      <td className="fine">{changed.length ? changed.join(" · ") : r.entity_id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty>Nothing yet.</Empty>}
      </Loaded>
    </>
  );
}
