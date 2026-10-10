"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Empty, Loaded, Notice, PageHead } from "@/components/ui";
import { useUser } from "@/lib/auth";
import { inr } from "@/lib/format";
import { fn, must, supabase } from "@/lib/supabase";
import { useAction, useData } from "@/lib/use-data";

type Quote = { pricePaise: number; discountPaise: number; amountPaise: number };

export default function EnrolPage() {
  return <Suspense><Enrol /></Suspense>;
}

// Enrol and pay (PAY-1 … PAY-3). finfun.club links here as /parent/enrol?program=pro&coupon=FESTIVE.
function Enrol() {
  const me = useUser();
  const router = useRouter();
  const params = useSearchParams();
  const { data, error } = useData(async () => {
    const [links, programs] = await Promise.all([
      supabase.from("guardian_links").select("students(id, first_name, grade)").eq("parent_id", me.id).then(must),
      supabase.from("programs").select("id, slug, name, grade_min, grade_max, price_paise, description, sticker").order("price_paise").then(must),
    ]);
    return { children: links.map((l: any) => l.students), programs };
  }, [me.id]);

  const [childId, setChildId] = useState(params.get("child") ?? "");
  const [slug, setSlug] = useState(params.get("program") ?? "");
  const [coupon, setCoupon] = useState(params.get("coupon") ?? "");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const priceCheck = useAction();
  const pay = useAction();

  const child = data?.children.find((c: any) => c.id === childId);
  const fits = data?.programs.filter((p: any) => !child || (child.grade >= p.grade_min && child.grade <= p.grade_max)) ?? [];

  useEffect(() => {
    if (data && !childId && data.children.length === 1) setChildId(data.children[0].id);
  }, [data, childId]);
  useEffect(() => {
    if (child && !fits.some((p: any) => p.slug === slug)) setSlug(fits[0]?.slug ?? "");
  }, [child, fits, slug]);
  useEffect(() => {
    setQuote(null);
    if (!childId || !slug) return;
    priceCheck.run(async () => setQuote(await fn("enrolments", { studentId: childId, program: slug, coupon, dryRun: true })));
    // Re-price only when the child or program changes; a typed coupon is applied with its button.
  }, [childId, slug]);

  const applyCoupon = () => priceCheck.run(async () => setQuote(await fn("enrolments", { studentId: childId, program: slug, coupon, dryRun: true })));

  const checkout = () => pay.run(async () => {
    setInfo(null);
    try {
      const r = await fn("enrolments", { studentId: childId, program: slug, coupon });
      if (r.status === "active") return router.push("/parent");
      await openRazorpay(r, me, () => router.push("/parent?paid=1"));
    } catch (e) {
      if ((e as { status?: number }).status === 503) return setInfo((e as Error).message + " Your enrolment is saved on your dashboard.");
      throw e;
    }
  });

  return (
    <>
      <PageHead title="Enrol in FinFun" sub={<Link href="/parent">My children</Link>} />
      <Loaded data={data} error={error}>
        {(d) => !d.children.length ? <Empty>First <Link href="/parent">add your child</Link>, then come back to enrol.</Empty> : (
          <div className="split">
            <div className="card stack">
              <label>Child
                <select value={childId} onChange={(e) => setChildId(e.target.value)}>
                  <option value="">Choose…</option>
                  {d.children.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} · grade {c.grade}</option>)}
                </select>
              </label>
              <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
                <legend style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>Program</legend>
                {(child ? fits : d.programs).map((p: any) => (
                  <label key={p.slug} className="check card" style={{ margin: 0, boxShadow: "none", padding: 14, alignItems: "center" }}>
                    <input type="radio" name="program" checked={slug === p.slug} onChange={() => setSlug(p.slug)} />
                    <img src={p.sticker} alt="" width={56} height={56} />
                    <span><strong>{p.name}</strong> · {inr(p.price_paise)}<br /><span className="fine">Grades {p.grade_min}–{p.grade_max}. {p.description}</span></span>
                  </label>
                ))}
                {child && !fits.length && <Notice kind="error">No program for grade {child.grade} yet.</Notice>}
              </fieldset>
              <div className="row">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" aria-label="Coupon code" style={{ width: 200 }} />
                <button className="btn white" onClick={applyCoupon} disabled={!childId || !slug || priceCheck.busy}>Apply</button>
              </div>
              <Notice kind="error">{priceCheck.error}</Notice>
            </div>

            <div className="card stack">
              <h2 style={{ margin: 0 }}>Summary</h2>
              {quote ? (
                <>
                  <div className="spread"><span>Program fee</span><span>{inr(quote.pricePaise)}</span></div>
                  {quote.discountPaise > 0 && <div className="spread"><span>Coupon {coupon}</span><span>−{inr(quote.discountPaise)}</span></div>}
                  <div className="spread" style={{ fontWeight: 800, fontSize: "1.2rem" }}><span>To pay</span><span>{inr(quote.amountPaise)}</span></div>
                  <button className="btn blue lg" onClick={checkout} disabled={pay.busy}>
                    {pay.busy ? "Please wait…" : quote.amountPaise ? `Pay ${inr(quote.amountPaise)}` : "Enrol for free"}
                  </button>
                  <p className="fine" style={{ margin: 0 }}>UPI, cards and netbanking via Razorpay. Only parents can pay.</p>
                </>
              ) : <p className="muted">Pick a child and a program to see the price.</p>}
              <Notice kind="error">{pay.error}</Notice>
              <Notice>{info}</Notice>
            </div>
          </div>
        )}
      </Loaded>
    </>
  );
}

/** Opens Razorpay Checkout for an order the backend created. Only reached once Razorpay keys are set. */
function openRazorpay(order: { razorpayOrderId: string; razorpayKeyId: string; amountPaise: number }, me: { email: string | null; phone: string | null }, onPaid: () => void) {
  return new Promise<void>((resolve, reject) => {
    const start = () => {
      const rzp = new (window as any).Razorpay({
        key: order.razorpayKeyId,
        order_id: order.razorpayOrderId,
        amount: order.amountPaise,
        currency: "INR",
        name: "FinFun",
        prefill: { email: me.email ?? undefined, contact: me.phone ? `+${me.phone}` : undefined },
        theme: { color: "#2970e3" },
        handler: () => { onPaid(); resolve(); }, // the webhook confirms the payment; this just moves the parent on
        modal: { ondismiss: () => resolve() },
      });
      rzp.on("payment.failed", () => reject(new Error("The payment didn't go through. You can try again.")));
      rzp.open();
    };
    if ((window as any).Razorpay) return start();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = start;
    s.onerror = () => reject(new Error("Couldn't load the payment window. Check your connection and try again."));
    document.body.appendChild(s);
  });
}
