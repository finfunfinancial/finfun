import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionCta, SectionHead } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Money and well-being",
  description: "Healthy money habits, talking about money worries, and where children and parents can get support.",
  alternates: { canonical: "/wellbeing" },
};

// TODO(FinFun): have a counsellor review this page and add FinFun’s own well-being sessions if offered.
const forChildren = [
  "It’s normal to feel worried about money. Talking to a grown-up you trust helps.",
  "Comparing what you have with friends can make you feel bad. Focus on your own goals.",
  "Making a mistake with money is how everyone learns — what matters is what you do next.",
  "If someone online pressures you to send money or share an OTP, stop and tell an adult.",
];
const forParents = [
  "Talk about money calmly and openly; children copy how we feel about money.",
  "Let children make small choices with pocket money — and small mistakes.",
  "Praise saving and thoughtful choices, not just how much is saved.",
  "Watch for signs of stress, secrecy about money, or being targeted by scams.",
];

export default function Wellbeing() {
  return (
    <>
      <PageHero eyebrow="Well-being" title={<>Money and <span className="mark">feeling okay</span></>} art="/a/sticker/06-rupi-thinks.webp" tone="bg-green"
        lead="Money skills are about confidence, not just numbers. Here’s how to keep money talk healthy at home." />
      <section className="section" aria-label="Well-being tips">
        <div className="wrap grid g2">
          <div className="card">
            <h2>For children</h2>
            <ul className="ticks">{forChildren.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div className="card">
            <h2>For parents</h2>
            <ul className="ticks">{forParents.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      </section>
      <section className="section bg-white" aria-labelledby="help-h">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <SectionHead title={<span id="help-h">Need to talk to someone?</span>}>
            If you or your child feel overwhelmed, India’s free Tele-MANAS mental health helpline is open 24×7 on <a href="tel:14416">14416</a>. If a child is in danger, call <a href="tel:112">112</a>.
          </SectionHead>
          <p className="center">Worried about a scam? Read <Link href="/blog/upi-scams-every-teen-should-know">UPI scams every teen should know</Link>.</p>
          <SectionCta links={[{ label: "Contact FinFun", href: "/contact", tone: "white" }]} />
        </div>
      </section>
    </>
  );
}
