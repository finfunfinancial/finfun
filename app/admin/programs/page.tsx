"use client";
import Link from "next/link";
import { Loaded, Notice, PageHead } from "@/components/lms/ui";
import { inr } from "@/lib/lms/format";
import { must, supabase } from "@/lib/lms/supabase";
import { useAction, useData } from "@/lib/lms/use-data";

// Program catalog (CAT-1). The marketing site and the enrol flow read prices from here.
export default function Programs() {
  const { data, error, reload } = useData(() =>
    supabase.from("programs").select("*, modules(count)").order("price_paise").then(must),
  );
  return (
    <>
      <PageHead title="Programs" sub="Prices and descriptions here are what parents see and pay." />
      <Loaded data={data} error={error}>
        {(programs) => (
          <div className="grid wide">
            {programs.map((p: any) => <ProgramCard key={p.id} p={p} onSaved={reload} />)}
          </div>
        )}
      </Loaded>
    </>
  );
}

function ProgramCard({ p, onSaved }: { p: any; onSaved: () => void }) {
  const { busy, error, run } = useAction();
  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    run(async () => {
      const rupees = Number(f.get("price"));
      if (!(rupees >= 0)) throw new Error("Enter a price in rupees.");
      must(await supabase.from("programs").update({
        name: String(f.get("name")).trim(),
        description: String(f.get("description")).trim(),
        grade_min: Number(f.get("grade_min")),
        grade_max: Number(f.get("grade_max")),
        price_paise: Math.round(rupees * 100),
        active: f.get("active") === "on",
      }).eq("id", p.id));
      onSaved();
    });
  };
  return (
    <form className="card stack" onSubmit={save}>
      <div className="spread">
        <h2 style={{ margin: 0 }}>{p.name}</h2>
        <span className="chip">{inr(p.price_paise)}</span>
      </div>
      <label>Name<input name="name" defaultValue={p.name} required /></label>
      <div className="fields">
        <label>Price (₹)<input name="price" type="number" min={0} step="0.01" defaultValue={p.price_paise / 100} required /></label>
        <label>From grade<input name="grade_min" type="number" min={3} max={10} defaultValue={p.grade_min} required /></label>
        <label>To grade<input name="grade_max" type="number" min={3} max={10} defaultValue={p.grade_max} required /></label>
      </div>
      <label>Description<textarea name="description" defaultValue={p.description ?? ""} /></label>
      <label className="check"><input type="checkbox" name="active" defaultChecked={p.active} /> Open for enrolment</label>
      <Notice kind="error">{error}</Notice>
      <div className="spread">
        <Link href={`/admin/programs/${p.id}`}>Curriculum ({p.modules[0]?.count ?? 0} modules) →</Link>
        <button className="btn" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
