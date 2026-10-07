import type { Metadata } from "next";
import Link from "next/link";
import Img from "@/components/Img";
import { CTA, Faq, JoinBanner, JsonLd, PageHero, ProgramCard, SectionCta, SectionHead, faqJsonLd } from "@/components/Sections";
import Testimonials from "@/components/Testimonials";
import { parentFaq, parentTopics, programs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Money skills for your teen",
  description: "Raise a money-smart teen. FinFun teaches grades 3–10 budgeting, saving, UPI and scam safety, SIPs and investing through live, game-based sessions.",
  alternates: { canonical: "/parents" },
};

export default function Parents() {
  return (
    <>
      <JsonLd data={faqJsonLd(parentFaq)} />
      <PageHero
        eyebrow="For parents of grades 3–10"
        title={<>Raise a <span className="mark">money-smart</span> teen</>}
        lead="Your teen already uses UPI and shops online. FinFun teaches them to budget, save, spot scams and start investing — through games they actually look forward to."
        art="/a/sticker/07-family-budget.webp"
        artAlt=""
        tone="bg-pink"
      >
        <div className="btn-row">
          <Link className="btn btn-blue btn-lg" href="/enrol" data-track="enrol_click">
            Enroll your teen
          </Link>
          <Link className="btn btn-white btn-lg" href="#programs">
            See programs & prices
          </Link>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="learn-h">
        <div className="wrap">
          <SectionHead eyebrow="What your teen learns" title={<span id="learn-h">Real money topics, by grade</span>} />
          <div className="grid g3">
            {parentTopics.map((t) => (
              <div className="card topic-card" key={t.title}>
                <Img src={t.sticker} alt="" sizes="96px" loading="lazy" />
                <div>
                  <span className={`chip ${t.grade.startsWith("Grade 8") ? "" : "sky"}`}>{t.grade}</span>
                  <h3>{t.title}</h3>
                </div>
              </div>
            ))}
          </div>
          <SectionCta links={[{ ...CTA.programs, href: "#programs" }, CTA.enrol]} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="sample-h">
        <div className="wrap split">
          <div>
            <SectionHead left eyebrow="Try a sample activity" title={<span id="sample-h">Scam or not?</span>}>
              A message says: “You won ₹10,000! Scan this QR code to claim it.” What should your teen do?
            </SectionHead>
            <ul className="ticks">
              <li>Never scan to <strong>receive</strong> money — scanning is only for paying.</li>
              <li>Real prizes don’t ask for a PIN, OTP or payment.</li>
              <li>Tell a parent and report the number.</li>
            </ul>
            <p className="muted mt">Every FinFun session is built from activities like this — quick, real and game-based.</p>
            <SectionCta links={[CTA.enrol]} />
          </div>
          <Img className="sticker" src="/a/sticker/09-scam-alert.webp" alt="Sticker of a phone asking for an OTP with a warning sign: Scam alert!" sizes="(max-width: 860px) 80vw, 460px" loading="lazy" style={{ maxWidth: 420, justifySelf: "center" }} />
        </div>
      </section>

      <section id="programs" className="section bg-sky" aria-labelledby="progs-h">
        <div className="wrap">
          <SectionHead eyebrow="Programs & prices" title={<span id="progs-h">Choose your teen’s program</span>} />
          <div className="grid g2">
            {programs.map((p) => (
              <ProgramCard key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="pt-h">
        <div className="wrap">
          <SectionHead eyebrow="Parents & teachers" title={<span id="pt-h">Families who’ve seen the change</span>} />
          <Testimonials groups={["parent", "teacher"]} />
          <SectionCta links={[CTA.enrol]} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="faq-h">
        <div className="wrap">
          <SectionHead eyebrow="FAQ" title={<span id="faq-h">Questions parents ask</span>} />
          <Faq items={parentFaq} />
          <SectionCta links={[CTA.enrol, { label: "Ask us a question", href: "/contact", tone: "white" }]} />
        </div>
      </section>

      <JoinBanner audience="parents" title="Give your teen a head start" text="Enroll in a few minutes. Pay by UPI, card or netbanking." />
    </>
  );
}
