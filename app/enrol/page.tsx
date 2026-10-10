import type { Metadata } from "next";
import Link from "next/link";
import { EnrolForm } from "@/components/Forms";
import Checkout from "@/components/lms/Checkout";
import Img from "@/components/Img";
import { JoinSteps, inr } from "@/components/Sections";
import { programs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Enroll your child",
  description: "Enroll your child in FinFun Basic (grades 3–5), FinFun Pro (grades 6–7) or FinFun Advantage (grades 8–10). Pay securely by UPI, card or netbanking.",
  alternates: { canonical: "/enrol" },
};

// Online checkout (log in → pay → My courses) is switched on per deployment once parents can receive login codes
// (SMS or email set up in Supabase). Until then the lead form below keeps collecting enrolments.
const onlineCheckout =
  process.env.NEXT_PUBLIC_ONLINE_CHECKOUT === "on" && !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_KEY;

export default async function Enroll({ searchParams }: PageProps<"/enrol">) {
  const { program, coupon } = await searchParams;
  return (
    <section className="section doodle bg-yellow">
      <div className="wrap split" style={{ alignItems: "start" }}>
        <div>
          <div style={{ marginBottom: 24 }}><JoinSteps current={2} /></div>
          <span className="eyebrow">Enroll</span>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>Enroll your child</h1>
          <p className="muted" style={{ fontSize: "1.15rem" }}>Fill in a few details, then pay securely. It takes about two minutes.</p>
          <div className="stack mt">
            {programs.map((p) => (
              <div className="card topic-card" key={p.slug} style={{ padding: 16 }}>
                <Img src={p.sticker} alt="" sizes="96px" />
                <div>
                  <span className="chip">{p.grades}</span>
                  <h2 style={{ fontSize: "1.3rem", margin: "6px 0 2px" }}>
                    {p.name} · {inr(p.price)} <small style={{ fontSize: "0.9rem" }}>per child</small>
                  </h2>
                  <p>
                    {p.focus} <Link href={`/programs/${p.slug}`}>Details</Link>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="fine mt">Only a parent or guardian can enroll. We collect just your child’s first name and grade, and never share or display it publicly.</p>
        </div>
        {onlineCheckout ? (
          <div className="portal">
            <div className="card">
              <Checkout program={typeof program === "string" ? program : undefined} coupon={typeof coupon === "string" ? coupon : undefined} />
            </div>
          </div>
        ) : (
          <div className="card">
            <EnrolForm program={typeof program === "string" ? program : undefined} coupon={typeof coupon === "string" ? coupon : undefined} />
          </div>
        )}
      </div>
    </section>
  );
}
