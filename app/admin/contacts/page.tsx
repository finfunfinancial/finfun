"use client";
import { useState } from "react";
import { Empty, Loaded, PageHead, statusChip } from "@/components/lms/ui";
import { useUser } from "@/lib/lms/auth";
import { downloadCsv, when } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";
import { TOPIC_LABELS } from "@/components/lms/EnquiryForm";

type Tab = "new" | "contacted" | "all";
// Short labels for the admin table (the website form uses friendlier ones).
const TOPIC: Record<string, string> = { ...TOPIC_LABELS, parent: "Parent", school: "School", partnership: "CSR / partnership", other: "Other" };

// Messages from the finfun.club/contact form. "Mark contacted" records who followed up, when, and an optional note.
export default function ContactRequests() {
  const me = useUser();
  const [tab, setTab] = useState<Tab>("new");
  const [topic, setTopic] = useState("all");
  const { data, error, reload } = useData(() => {
    let query = supabase.from("contact_requests").select("*, profiles(full_name, email)").order("created_at", { ascending: false }).limit(300);
    if (tab !== "all") query = query.eq("status", tab);
    if (topic !== "all") query = query.eq("topic", topic);
    return query.then(must);
  }, [tab, topic]);

  // Reload this list and tell the sidebar to update its "new" count.
  const changed = () => {
    reload();
    window.dispatchEvent(new Event("contacts-changed"));
  };

  const markContacted = async (id: string) => {
    const note = prompt("Mark as contacted. Add a note (optional), e.g. “Called, sending batch timings on WhatsApp”:");
    if (note === null) return;
    const { error } = await supabase.from("contact_requests")
      .update({ status: "contacted", contacted_at: new Date().toISOString(), contacted_by: me.id, note: note.trim() || null }).eq("id", id);
    if (error) alert(error.message);
    changed();
  };
  const reopen = async (id: string) => {
    const { error } = await supabase.from("contact_requests").update({ status: "new", contacted_at: null, contacted_by: null }).eq("id", id);
    if (error) alert(error.message);
    changed();
  };

  const exportCsv = (rows: any[]) => downloadCsv(`finfun-contact-requests-${tab}.csv`, rows.map((r) => ({
    received: r.created_at, name: r.name, email: r.email, phone: r.phone ?? "", topic: TOPIC[r.topic], organisation: r.organisation ?? "",
    child_grade: r.child_grade ?? "", preferred_time: r.preferred_time ?? "", message: r.message,
    status: r.status, contacted_at: r.contacted_at ?? "", contacted_by: r.profiles?.full_name ?? r.profiles?.email ?? "", note: r.note ?? "",
  })));

  return (
    <>
      <PageHead title="Contact requests" sub="Every website form: contact, free demo classes, teacher training, partnerships and contests. Reply, then mark them contacted.">
        <div className="tabs" style={{ gridTemplateColumns: "repeat(3, 1fr)", width: 330, margin: 0 }}>
          <button aria-pressed={tab === "new"} onClick={() => setTab("new")}>New</button>
          <button aria-pressed={tab === "contacted"} onClick={() => setTab("contacted")}>Contacted</button>
          <button aria-pressed={tab === "all"} onClick={() => setTab("all")}>All</button>
        </div>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Filter by topic" style={{ width: 200 }}>
          <option value="all">All topics</option>
          {Object.keys(TOPIC_LABELS).map((t) => <option key={t} value={t}>{TOPIC[t]}</option>)}
        </select>
        {data && data.length > 0 && <button className="btn white" onClick={() => exportCsv(data)}>Export CSV</button>}
      </PageHead>
      <Loaded data={data} error={error}>
        {(rows) => rows.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Received</th><th>From</th><th>About</th><th style={{ width: "38%" }}>Message</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{when(r.created_at)}</td>
                    <td>
                      <strong>{r.name}</strong><br />
                      <a href={`mailto:${r.email}`}>{r.email}</a>
                      {r.phone && <><br /><a href={`tel:${r.phone.replace(/\s/g, "")}`}>{r.phone}</a> · <a href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^(?=\d{10}$)/, "91")}`} target="_blank" rel="noreferrer">WhatsApp</a></>}
                    </td>
                    <td>
                      {TOPIC[r.topic]}
                      {r.organisation && <div className="fine">{r.organisation}</div>}
                      {r.child_grade && <div className="fine">Grade {r.child_grade}</div>}
                      {r.preferred_time && <div className="fine">Prefers: {r.preferred_time}</div>}
                    </td>
                    <td style={{ whiteSpace: "pre-wrap", minWidth: 260 }}>{r.message}</td>
                    <td>
                      {statusChip(r.status)}
                      {r.status === "contacted" && (
                        <div className="fine" style={{ marginTop: 4 }}>
                          {r.profiles?.full_name ?? r.profiles?.email ?? "Admin"}, {when(r.contacted_at)}
                          {r.note && <><br />“{r.note}”</>}
                        </div>
                      )}
                    </td>
                    <td className="num">
                      {r.status === "new"
                        ? <button className="btn sm" onClick={() => markContacted(r.id)}>Mark contacted</button>
                        : <button className="btn white sm" onClick={() => reopen(r.id)}>Reopen</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>{tab === "new" ? "No new messages — you’re all caught up." : "Nothing here yet."}</Empty>}
      </Loaded>
    </>
  );
}
