"use client";
import { Empty, Loaded, Notice, PageHead } from "@/components/ui";
import { day, inr } from "@/lib/format";
import { must, supabase } from "@/lib/supabase";
import { useAction, useData } from "@/lib/use-data";

// Coupons (PAY-3). Parents type the code on the enrol page, or follow /enrol?coupon=CODE from finfun.club.
export default function Coupons() {
  const { data, error, reload } = useData(async () => {
    const [coupons, programs, used] = await Promise.all([
      supabase.from("coupons").select("*").order("code").then(must),
      supabase.from("programs").select("id, name").order("price_paise").then(must),
      supabase.from("orders").select("coupon_id").eq("status", "paid").not("coupon_id", "is", null).then(must),
    ]);
    const uses: Record<string, number> = {};
    used.forEach((o: any) => (uses[o.coupon_id] = (uses[o.coupon_id] ?? 0) + 1));
    return { coupons, programs, uses };
  });

  const toggle = async (c: any) => {
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) alert(error.message);
    reload();
  };

  return (
    <>
      <PageHead title="Coupons" />
      <Loaded data={data} error={error}>
        {({ coupons, programs, uses }) => (
          <>
            <NewCoupon programs={programs} onDone={reload} />
            {coupons.length ? (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Code</th><th>Discount</th><th>Programs</th><th className="num">Used</th><th>Expires</th><th>Active</th></tr></thead>
                  <tbody>
                    {coupons.map((c: any) => (
                      <tr key={c.id}>
                        <td><strong>{c.code}</strong></td>
                        <td>{c.kind === "percent" ? `${c.value}%` : inr(c.value)}</td>
                        <td>{c.program_ids ? programs.filter((p: any) => c.program_ids.includes(p.id)).map((p: any) => p.name).join(", ") : "All"}</td>
                        <td className="num">{uses[c.id] ?? 0}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                        <td>{c.expires_at ? day(c.expires_at) : "Never"}</td>
                        <td><button className={c.active ? "btn sm" : "btn white sm"} onClick={() => toggle(c)}>{c.active ? "On" : "Off"}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <Empty>No coupons yet.</Empty>}
          </>
        )}
      </Loaded>
    </>
  );
}

function NewCoupon({ programs, onDone }: { programs: any[]; onDone: () => void }) {
  const { busy, error, run } = useAction();
  const create = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      const kind = String(f.get("kind"));
      const value = Number(f.get("value"));
      if (kind === "percent" && (value < 1 || value > 100)) throw new Error("Percent must be 1 to 100.");
      const picked = f.getAll("programs") as string[];
      must(await supabase.from("coupons").insert({
        code: String(f.get("code")).trim().toUpperCase(),
        kind,
        value: kind === "percent" ? value : Math.round(value * 100),
        program_ids: picked.length ? picked : null,
        max_uses: Number(f.get("max")) || null,
        per_parent_limit: Number(f.get("perParent")) || 1,
        expires_at: f.get("expires") ? `${f.get("expires")}T23:59:59+05:30` : null,
      }));
      form.reset();
      onDone();
    });
  };
  return (
    <details className="panel">
      <summary>New coupon</summary>
      <div>
        <form className="stack" onSubmit={create}>
          <div className="fields">
            <label>Code<input name="code" pattern="[A-Za-z0-9]{3,20}" title="3–20 letters or numbers" required style={{ textTransform: "uppercase" }} /></label>
            <label>Type
              <select name="kind"><option value="percent">Percent off</option><option value="flat">Rupees off</option></select>
            </label>
            <label>Value<input name="value" type="number" min={1} step="0.01" required /></label>
            <label>Max uses (blank = unlimited)<input name="max" type="number" min={1} /></label>
            <label>Uses per parent<input name="perParent" type="number" min={1} defaultValue={1} /></label>
            <label>Expires on<input name="expires" type="date" /></label>
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="fine">Only for these programs (none ticked = all)</legend>
            <div className="row">
              {programs.map((p) => <label key={p.id} className="check"><input type="checkbox" name="programs" value={p.id} /> {p.name}</label>)}
            </div>
          </fieldset>
          <Notice kind="error">{error}</Notice>
          <div className="row end"><button className="btn" disabled={busy}>{busy ? "Creating…" : "Create coupon"}</button></div>
        </form>
      </div>
    </details>
  );
}
