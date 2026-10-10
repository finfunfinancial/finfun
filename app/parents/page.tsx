import type { Metadata } from "next";
import Link from "next/link";
import Img from "@/components/Img";
import { CTA, Faq, JoinBanner, JoinSteps, JsonLd, PageHero, ProgramCard, SectionCta, SectionHead, faqJsonLd } from "@/components/Sections";
import Testimonials from "@/components/Testimonials";
import { parentFaq, parentTopics, programs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Money skills for your teen",
  description: "Raise a money-smart teen. FinFun teaches grades 3–10 budgeting, saving, UPI and scam safety, SIPs and investing through live, game-based sessions.",
  alternates: { canonical: "/parents" },
};

const parentAssist = [
  { title: "Make a budget together", text: "A simple way to split pocket money into spending, saving and sharing.", href: "/blog/what-is-a-budget", img: "/a/sticker/07-family-budget.webp" },
  { title: "Needs vs wants", text: "One question to ask together before every purchase.", href: "/blog/needs-vs-wants", img: "/a/sticker/06-need-or-want.webp" },
  { title: "Stay safe online", text: "The UPI and OTP scams to explain to your child this week.", href: "/blog/upi-scams-every-teen-should-know", img: "/a/sticker/09-scam-alert.webp" },
  { title: "From pocket money to SIP", text: "How small, regular saving grows — explained simply.", href: "/blog/pocket-money-to-first-sip", img: "/a/sticker/01-sip-every-month.webp" },
  { title: "FinFun Toolkit", text: "Games, a finance journal and activity sheets for home.", href: "/toolkit", img: "/a/sticker/12-money-fun.webp" },
  { title: "Money and well-being", text: "Keep money talk calm, and know where to get help.", href: "/wellbeing", img: "/a/sticker/06-rupi-thinks.webp" },
];

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
            Enroll your child
          </Link>
          <Link className="btn btn-white btn-lg" href="/try">
            Try a free lesson
          </Link>
        </div>
      </PageHero>

      <section className="section tight" aria-label="How to join">
        <div className="wrap"><JoinSteps current={0} /></div>
      </section>

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
          <Img className="sticker" src="/a/sticker/09-scam-alert.webp" alt="Sticker of a phone asking for an OTP with a warning sign: Scam alert!" sizes="(max-width: 860px) 80vw, 460px" loading="lazy" style={{ maxWidth: "min(420px, 100%)", justifySelf: "center" }} />
        </div>
      </section>

      <section id="programs" className="section bg-sky" aria-labelledby="progs-h">
        <div className="wrap">
          <SectionHead eyebrow="Courses & prices" title={<span id="progs-h">Choose your child’s course</span>} />
          <div className="grid g2">
            {programs.map((p) => (
              <ProgramCard key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="assist-h" id="assist">
        <div className="wrap">
          <SectionHead eyebrow="Parent assist" title={<span id="assist-h">Help your child practise at home</span>}>
            Small, everyday moments teach money best. Here’s where to start.
          </SectionHead>
          <div className="grid g3">
            {parentAssist.map((a) => (
              <Link className="card topic-card resource-card" key={a.title} href={a.href}>
                <Img src={a.img} alt="" sizes="96px" loading="lazy" />
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              </Link>
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
