import Link from "next/link";
import Img from "@/components/Img";
import { CTA, Classroom, Comparison, ImpactBand, JoinBanner, JsonLd, Partners, ProgramCard, SectionCta, SectionHead, Spotlight, WaysToJoin } from "@/components/Sections";
import PostCard from "@/components/PostCard";
import Testimonials from "@/components/Testimonials";
import { howItWorks, methods, programs, site, values } from "@/lib/content";
import { posts } from "@/lib/posts";

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "FinFun",
          url: site.url,
          email: site.email,
          telephone: site.phone,
          slogan: site.tagline,
        }}
      />
      <section className="hero doodle">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">{site.grades} · Ages 11–16</span>
            <h1>
              Money skills for <span className="mark">real life</span>
            </h1>
            <p className="lead">Budgeting, UPI and scam safety, SIPs and investing — learned through games, quizzes and challenges teens actually enjoy.</p>
            <div className="btn-row">
              <Link className="btn btn-blue btn-lg" href="/schools" data-track="path_schools">
                For Schools
              </Link>
              <Link className="btn btn-lg" href="/parents" data-track="path_parents">
                For Parents
              </Link>
            </div>
            <p className="hero-note">Trusted by 35,000+ schools across India</p>
          </div>
          <div className="bento">
            <div className="bento-tile bento-main">
              <Img src="/a/sticker/10-hi-im-rupi.webp" alt="Rupi, the FinFun coin mascot" priority sizes="(max-width: 860px) 60vw, 320px" />
            </div>
            <div className="bento-tile">
              <Img src="/a/sticker/02-scam-spotter.webp" alt="Scam Spotter sticker" priority sizes="(max-width: 860px) 30vw, 160px" />
            </div>
            <div className="bento-tile">
              <Img src="/a/sticker/01-sip-every-month.webp" alt="SIP every month sticker" priority sizes="(max-width: 860px) 30vw, 160px" />
            </div>
            <ul className="bento-chips" aria-label="Topics teens learn">
              {["UPI safety", "Budgeting", "Saving goals", "SIPs", "Scam alerts"].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ImpactBand />
      <Spotlight />

      <section className="section" aria-labelledby="why-h">
        <div className="wrap">
          <SectionHead eyebrow="Why FinFun" title={<span id="why-h">Skills school doesn’t teach, but life does</span>} />
          <div className="grid g3">
            {values.map((v) => (
              <div className="card icon-card" key={v.title}>
                <Img src={v.icon} alt="" sizes="120px" loading="lazy" />
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
          <SectionCta links={[CTA.programs, CTA.partner]} />
        </div>
      </section>

      <Comparison />

      <section className="section" aria-labelledby="how-h">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title={<span id="how-h">Learn&nbsp;→ Play&nbsp;→ Grow</span>} />
          <div className="steps">
            {howItWorks.map((s, i) => (
              <div className="card step" key={s.title}>
                <span className="step-num">{i + 1}</span>
                <Img src={s.img} alt="" sizes="130px" loading="lazy" />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <SectionCta links={[CTA.enrol, CTA.demo]} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="methods-h">
        <div className="wrap">
          <SectionHead eyebrow="Gamified learning" title={<span id="methods-h">Four ways teens learn with FinFun</span>} />
          <div className="grid g4">
            {methods.map((m) => (
              <div className="card method" key={m.title}>
                <Img src={m.img} alt="" sizes="(max-width: 800px) 90vw, 280px" loading="lazy" />
                <div>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>
          <SectionCta links={[CTA.demo, CTA.programs, { ...CTA.report, tone: "white" }]} />
        </div>
      </section>

      <section className="section bg-sky" aria-labelledby="programs-h">
        <div className="wrap">
          <SectionHead eyebrow="Programs" title={<span id="programs-h">Pick the right program for your teen</span>}>
            Three programs, built for how kids think at each stage.
          </SectionHead>
          <div className="grid g2">
            {programs.map((p) => (
              <ProgramCard key={p.slug} p={p} />
            ))}
          </div>
          <p className="center mt">
            <Link className="link-arrow" href="/programs">
              Compare programs →
            </Link>
          </p>
        </div>
      </section>

      <Partners />

      <section className="section" aria-labelledby="t-h">
        <div className="wrap">
          <SectionHead eyebrow="Testimonials" title={<span id="t-h">What schools, officials and parents say</span>} />
          <Testimonials />
          <SectionCta links={[CTA.partner, CTA.enrol]} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="blog-h">
        <div className="wrap">
          <SectionHead eyebrow="From the blog" title={<span id="blog-h">Money tips teens actually read</span>} />
          <div className="grid g3">
            {posts.slice(0, 3).map((p) => (
              <PostCard key={p.slug} p={p} />
            ))}
          </div>
          <SectionCta links={[{ label: "Read all articles", href: "/blog", tone: "white" }, CTA.enrol]} />
        </div>
      </section>

      <Classroom />
      <WaysToJoin />
      <JoinBanner />
    </>
  );
}
