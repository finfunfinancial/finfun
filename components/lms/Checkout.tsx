"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Notice } from "@/components/lms/ui";
import { useMe, type Me } from "@/lib/lms/auth";
import { inr } from "@/lib/lms/format";
import { fn, must, supabase } from "@/lib/lms/supabase";
import { useAction, useData } from "@/lib/lms/use-data";

type Quote = { pricePaise: number; discountPaise: number; amountPaise: number };
const NEW = "new";

/** Buy a course (PAY-1 … PAY-3): log in or sign up, pick or add the child, apply a coupon, pay. */
export default function Checkout({ program: initialProgram, coupon: initialCoupon }: { program?: string; coupon?: string }) {
  const me = useMe();
  if (me === undefined) return <p className="loading">Loading…</p>;
  if (!me) {
    const back = `/enrol?${new URLSearchParams({ ...(initialProgram && { program: initialProgram }), ...(initialCoupon && { coupon: initialCoupon }) })}`;
    return (
      <div className="stack">
        <h2 style={{ margin: 0 }}>Log in or sign up to enroll</h2>
        <p className="muted" style={{ margin: 0 }}>It takes a minute: enter your mobile number, type the code we send, and you’re in. Your course then appears under My courses.</p>
        <Link className="btn blue lg" href={`/login?next=${encodeURIComponent(back)}`}>Continue with mobile or email</Link>
      </div>
    );
  }
  if (me.role !== "parent") return <Notice>You’re logged in as FinFun staff. Log out to buy a course as a parent.</Notice>;
  return <Buy me={me} initialProgram={initialProgram} initialCoupon={initialCoupon} />;
}

function Buy({ me, initialProgram, initialCoupon }: { me: Me; initialProgram?: string; initialCoupon?: string }) {
  const router = useRouter();
  const { data, error } = useData(async () => {
    const [links, programs] = await Promise.all([
      supabase.from("guardian_links").select("students(id, first_name, grade)").eq("parent_id", me.id).then(must),
      supabase.from("programs").select("id, slug, name, grade_min, grade_max, price_paise").order("price_paise").then(must),
    ]);
    return { children: links.map((l: any) => l.students), programs };
  }, [me.id]);

  const [pickedChild, setChildId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [grade, setGrade] = useState(6);
  const [consent, setConsent] = useState(false);
  const [pickedSlug, setSlug] = useState(initialProgram ?? "");
  const [coupon, setCoupon] = useState((initialCoupon ?? "").toUpperCase());
  const [appliedCoupon, setAppliedCoupon] = useState(coupon);
  const [info, setInfo] = useState<string | null>(null);
  const pay = useAction();

  // Defaults follow the data: the first child on the account, and a program that fits the child's grade.
  const childId = pickedChild ?? data?.children[0]?.id ?? NEW;
  const child = data?.children.find((c: any) => c.id === childId);
  const childGrade: number = child ? child.grade : grade;
  const fits = (data?.programs ?? []).filter((p: any) => childGrade >= p.grade_min && childGrade <= p.grade_max);
  const slug: string = fits.some((p: any) => p.slug === pickedSlug) ? pickedSlug : fits[0]?.slug ?? "";
  const who = childId === NEW ? { learner: { firstName, grade, consent } } : { studentId: childId };

  // The price is re-checked on the server whenever the child, program or applied coupon changes.
  const price = useData<Quote | null>(
    () => (slug ? fn("enrolments", { ...who, learner: { firstName: firstName || "Child", grade, consent }, program: slug, coupon: appliedCoupon, dryRun: true }) : Promise.resolve(null)),
    [slug, childId, childGrade, appliedCoupon],
  );
  const quote = price.error ? null : price.data ?? null;

  const checkout = () => pay.run(async () => {
    setInfo(null);
    try {
      const r = await fn("enrolments", { ...who, program: slug, coupon: appliedCoupon });
      if (r.status === "active") return router.push("/my-courses");
      await openRazorpay(r, me, () => router.push("/my-courses?paid=1"));
    } catch (e) {
      if ((e as { status?: number }).status === 503) return setInfo((e as Error).message);
      throw e;
    }
  });

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!data) return <p className="loading">Loading…</p>;
  return (
    <div className="stack">
      <p className="fine" style={{ margin: 0 }}>Logged in as {me.phone ? `+${me.phone}` : me.email} · <Link href="/my-courses">My courses</Link></p>
      <label>Who is learning?
        <select value={childId} onChange={(e) => setChildId(e.target.value)}>
          {data.children.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} · grade {c.grade}</option>)}
          <option value={NEW}>{data.children.length ? "Another child…" : "My child"}</option>
        </select>
      </label>
      {childId === NEW && (
        <div className="fields">
          <label>Child’s first name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={40} required /></label>
          <label>Grade
            <select value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
              {[3, 4, 5, 6, 7, 8, 9, 10].map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>
          </label>
        </div>
      )}
      <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
        <legend style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>Program</legend>
        {fits.map((p: any) => (
          <label key={p.slug} className="check">
            <input type="radio" name="program" checked={slug === p.slug} onChange={() => setSlug(p.slug)} />
            <span><strong>{p.name}</strong> · grades {p.grade_min}–{p.grade_max} · {inr(p.price_paise)}</span>
          </label>
        ))}
        {!fits.length && <Notice kind="error">No program for grade {childGrade} yet.</Notice>}
      </fieldset>
      <div className="row">
        <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" aria-label="Coupon code" style={{ width: 180 }} />
        <button className="btn white" onClick={() => setAppliedCoupon(coupon)} disabled={!slug}>Apply</button>
      </div>
      <Notice kind="error">{price.error}</Notice>
      {childId === NEW && (
        <label className="check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>I am this child’s parent or guardian and I consent to FinFun using their first name and grade to run the program, as described in the <Link href="/privacy">privacy policy</Link>.</span>
        </label>
      )}
      {quote && (
        <div className="stack" style={{ gap: 4 }}>
          <div className="spread"><span>Program fee</span><span>{inr(quote.pricePaise)}</span></div>
          {quote.discountPaise > 0 && <div className="spread"><span>Coupon {appliedCoupon}</span><span>−{inr(quote.discountPaise)}</span></div>}
          <div className="spread" style={{ fontWeight: 800, fontSize: "1.2rem" }}><span>To pay</span><span>{inr(quote.amountPaise)}</span></div>
        </div>
      )}
      <button className="btn blue lg" onClick={checkout} disabled={!quote || pay.busy || (childId === NEW && (!firstName.trim() || !consent))}>
        {pay.busy ? "Please wait…" : quote ? (quote.amountPaise ? `Pay ${inr(quote.amountPaise)}` : "Enroll for free") : "Pay"}
      </button>
      <Notice kind="error">{pay.error}</Notice>
      {info && <Notice>{info} Your enrolment is saved — see <Link href="/my-courses">My courses</Link>.</Notice>}
      <p className="fine" style={{ margin: 0 }}>Secure payment by UPI, card or netbanking via Razorpay.</p>
    </div>
  );
}

/** Opens Razorpay Checkout for an order the backend created. Only reached once Razorpay keys are set. */
function openRazorpay(order: { razorpayOrderId: string; razorpayKeyId: string; amountPaise: number }, me: Me, onPaid: () => void) {
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
        handler: () => { onPaid(); resolve(); }, // the webhook confirms the payment; this just moves the buyer on
        modal: { ondismiss: () => resolve() },
      });
      rzp.on("payment.failed", () => reject(new Error("The payment didn’t go through. You can try again.")));
      rzp.open();
    };
    if ((window as any).Razorpay) return start();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = start;
    s.onerror = () => reject(new Error("Couldn’t load the payment window. Check your connection and try again."));
    document.body.appendChild(s);
  });
}
