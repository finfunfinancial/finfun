"use client";
import Link from "next/link";
import { useState } from "react";
import { Empty, Loaded, Notice, PageHead, statusChip } from "@/components/lms/ui";
import { clock, day, istToday, weekdays } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useAction, useData } from "@/lib/lms/use-data";

// Batches (BAT-1, BAT-2): cohorts with a weekly slot; creating one builds its session calendar.
export default function Batches() {
  const [show, setShow] = useState("open,running");
  const { data, error, reload } = useData(async () => {
    const [batches, programs] = await Promise.all([
      supabase.from("batches").select("*, programs(name), enrolments(count)")
        .in("status", show.split(",")).eq("enrolments.status", "active").order("start_date", { ascending: false }).then(must),
      supabase.from("programs").select("id, name").order("price_paise").then(must),
    ]);
    return { batches, programs };
  }, [show]);

  return (
    <>
      <PageHead title="Batches" sub="Each batch is one group of students with a weekly class slot.">
        <select value={show} onChange={(e) => setShow(e.target.value)} aria-label="Show batches">
          <option value="open,running">Open and running</option>
          <option value="completed,cancelled">Finished and cancelled</option>
        </select>
      </PageHead>
      <Loaded data={data} error={error}>
        {(d) => (
          <>
            <NewBatch {...d} onCreated={reload} />
            {d.batches.length ? (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Batch</th><th>Program</th><th>Slot</th><th>Starts</th><th className="num">Seats</th><th>Status</th></tr></thead>
                  <tbody>
                    {d.batches.map((b: any) => (
                      <tr key={b.id}>
                        <td><Link href={`/admin/batches/${b.id}`}><strong>{b.name}</strong></Link></td>
                        <td>{b.programs?.name}</td>
                        <td>{weekdays[b.weekday].slice(0, 3)} {clock(b.start_time)}</td>
                        <td>{day(b.start_date)}</td>
                        <td className="num">{b.enrolments[0]?.count ?? 0} / {b.seat_limit}</td>
                        <td>{statusChip(b.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty>No batches here yet.</Empty>}
          </>
        )}
      </Loaded>
    </>
  );
}

function NewBatch({ programs, onCreated }: { programs: any[]; onCreated: () => void }) {
  const { busy, error, run } = useAction();
  const create = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      const batch = must(await supabase.from("batches").insert({
        program_id: f.get("program"),
        name: String(f.get("name")).trim(),
        weekday: Number(f.get("weekday")),
        start_time: f.get("time"),
        start_date: f.get("start"),
        session_count: Number(f.get("sessions")),
        duration_min: Number(f.get("duration")),
        seat_limit: Number(f.get("seats")),
      }).select("id").single());
      must(await supabase.rpc("generate_sessions", { p_batch: batch.id }));
      form.reset();
      onCreated();
    });
  };
  return (
    <details className="panel">
      <summary>New batch</summary>
      <div>
        <form className="stack" onSubmit={create}>
          <div className="fields">
            <label>Program
              <select name="program" required>{programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </label>
            <label>Batch name<input name="name" placeholder="Pro · Saturday 10 AM" required /></label>
          </div>
          <div className="fields">
            <label>Day
              <select name="weekday" defaultValue={6}>{weekdays.map((w, i) => <option key={w} value={i}>{w}</option>)}</select>
            </label>
            <label>Time (IST)<input name="time" type="time" defaultValue="10:00" required /></label>
            <label>First week from<input name="start" type="date" defaultValue={istToday()} required /></label>
            <label>Sessions<input name="sessions" type="number" min={1} max={52} defaultValue={12} required /></label>
            <label>Minutes each<input name="duration" type="number" min={15} max={180} defaultValue={60} required /></label>
            <label>Seats<input name="seats" type="number" min={1} max={500} defaultValue={25} required /></label>
          </div>
          <p className="fine" style={{ margin: 0 }}>The class calendar is built automatically, skipping holidays.</p>
          <Notice kind="error">{error}</Notice>
          <div className="row end"><button className="btn" disabled={busy}>{busy ? "Creating…" : "Create batch"}</button></div>
        </form>
      </div>
    </details>
  );
}
