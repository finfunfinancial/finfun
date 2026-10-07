import type { Metadata } from "next";
import Img from "@/components/Img";
import { CTA, JoinBanner, SectionCta, SectionHead } from "@/components/Sections";
import { site, story, team } from "@/lib/content";

export const metadata: Metadata = {
  title: "About FinFun",
  description: "FinFun is building the future of financial dignity — teaching real money skills to students in grades 3 to 10 across India.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <>
      <section className="section tight bg-navy">
        <div className="wrap">
          <h1 className="sr-only">About FinFun: {site.tagline}</h1>
          <Img className="banner-img" src="/a/about-and-programs/banner-mission-1600x600.webp" alt="Our mission: building the future of financial dignity" priority sizes="(max-width: 1200px) 95vw, 1120px" style={{ boxShadow: "6px 6px 0 var(--yellow)" }} />
        </div>
      </section>

      <section className="section" aria-labelledby="why-h">
        <div className="wrap split">
          <div>
            <SectionHead left eyebrow="Our mission" title={<span id="why-h">Financial dignity starts in the classroom</span>} />
            <p>Most of us learn about money the hard way — through a scam, a debt or a missed chance to save. FinFun exists so the next generation doesn’t have to.</p>
            <p>We turn money skills into games, stories and challenges that kids and teens in grades 3 to 10 genuinely enjoy, and we train teachers so every school can run them — government and private, English and vernacular.</p>
            <SectionCta links={[CTA.programs, CTA.partner]} />
          </div>
          <Img className="sticker" src="/a/sticker/06-super-saver.webp" alt="" sizes="300px" loading="lazy" style={{ maxWidth: 280, justifySelf: "center" }} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="story-h">
        <div className="wrap">
          <SectionHead eyebrow="Our story" title={<span id="story-h">How FinFun grew</span>} />
          <ol className="timeline">
            {story.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <SectionCta links={[{ label: "See our impact", href: "/impact" }, CTA.enrol]} />
        </div>
      </section>

      <section className="section" aria-labelledby="team-h">
        <div className="wrap">
          <SectionHead eyebrow="Team" title={<span id="team-h">The people behind FinFun</span>} />
          <div className="grid g4">
            {team.map((t) => (
              <div className="card icon-card" key={t.name}>
                <Img src={t.avatar} alt="" sizes="120px" loading="lazy" style={{ borderRadius: "50%", border: "3px solid var(--ink)" }} />
                <h3>{t.name}</h3>
                <p>{t.role}</p>
              </div>
            ))}
          </div>
          <SectionCta links={[{ label: "Talk to our team", href: "/contact" }]} />
        </div>
      </section>

      <section className="section tight bg-yellow">
        <div className="wrap center">
          <h2>Project Financial Dignity</h2>
          <p className="muted" style={{ maxWidth: 620, margin: "0 auto 20px" }}>
            For students from Class 11 to undergraduate, our Financial Passport program continues the journey.
          </p>
          {site.financialPassportUrl ? (
            <a className="btn" href={site.financialPassportUrl} target="_blank" rel="noopener">
              Visit Financial Passport ↗
            </a>
          ) : (
            <span className="chip white">Link coming soon</span>
          )}
        </div>
      </section>
      <JoinBanner />
    </>
  );
}
