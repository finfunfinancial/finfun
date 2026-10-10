import Link from "next/link";
import Img from "@/components/Img";
import { CTA, Classroom, Comparison, ImpactBand, JoinBanner, JsonLd, Partners, ProgramCard, SectionCta, SectionHead, Spotlight, WaysToJoin } from "@/components/Sections";
import PostCard from "@/components/PostCard";
import Testimonials from "@/components/Testimonials";
import { festiveOffer, howItWorks, methods, programForGrade, programs, rubricLevels, site, spotlight, values } from "@/lib/content";
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
            <span className="eyebrow">{site.grades} · Ages 8–16</span>
            <h1>
              Money confidence for <span className="mark">real life</span>
            </h1>
            <p className="lead">Children build lifelong money habits — budgeting, saving, staying safe online and investing — through games, quizzes and challenges they actually enjoy.</p>
            <div className="btn-row">
              <Link className="btn btn-blue btn-lg" href="/programs" data-track="path_courses">
                Find a course
              </Link>
              <Link className="btn btn-lg" href="/try" data-track="path_trial">
                Try it free
              </Link>
              {festiveOffer.active && (
                <Link className="btn btn-lg btn-festive" href={`/enrol?coupon=${festiveOffer.code}`} data-track="festive_click">
                  🎉 Festive offer{festiveOffer.discount && `: ${festiveOffer.discount} off`}
                </Link>
              )}
            </div>
            <p className="hero-grades">
              <span>Course by grade:</span>
              {[3, 4, 5, 6, 7, 8, 9, 10].map((g) => {
                const p = programForGrade(g);
                return p && <Link key={g} href={`/programs/${p.slug}`}>{g}</Link>;
              })}
            </p>
            <p className="hero-note">Trusted by 35,000+ schools across India · <Link href="/schools">For schools</Link></p>
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

      <section className="section" aria-labelledby="t-h">
        <div className="wrap">
          <SectionHead eyebrow="Testimonials" title={<span id="t-h">What schools, officials and parents say</span>} />
          <Testimonials />
        </div>
      </section>

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
          <SectionHead eyebrow="Courses by grade" title={<span id="programs-h">Pick the right course for your child</span>}>
            Three courses, built for how children think at each stage.
          </SectionHead>
          <div className="grid g2">
            {programs.map((p) => (
              <ProgramCard key={p.slug} p={p} />
            ))}
          </div>
          <p className="center mt">
            <Link className="link-arrow" href="/programs">
              Compare courses →
            </Link>{" "}
            · <Link className="link-arrow" href="/try">Try a free lesson →</Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="out-h">
        <div className="wrap">
          <SectionHead eyebrow="Student outcomes" title={<span id="out-h">Confidence you can measure</span>}>
            Every child is assessed on four money skills, from Bronze to Gold — and the habits show up at home.
          </SectionHead>
          <div className="grid g3">
            <div className="card stack">
              <h3>Skills, assessed</h3>
              <ol className="rubric-levels" aria-label="Levels" style={{ margin: 0 }}>
                {rubricLevels.map((l) => (
                  <li key={l.name}>
                    <Img src={l.medal} alt="" sizes="40px" loading="lazy" />
                    <strong>{l.name}</strong> {l.label}
                  </li>
                ))}
              </ol>
              <p style={{ margin: 0 }}>Money basics · Saving & goals · Smart spending · Staying safe</p>
            </div>
            <div className="card stack">
              <h3>Habits that stick</h3>
              <p className="spotlight-head" style={{ margin: 0 }}>“{spotlight.headline}”</p>
              <p className="fine" style={{ margin: 0 }}>{spotlight.name}, {spotlight.role}</p>
            </div>
            <figure className="card stack" style={{ margin: 0 }}>
              <h3>Mind maps by students</h3>
              <Img src="/a/home-page/method-mind-mapping.webp" alt="Children connecting earn, save, spend and share in a mind map" sizes="(max-width: 800px) 90vw, 360px" loading="lazy" />
              {/* TODO(FinFun): replace with photos of real student mind maps (with parent consent). */}
              <figcaption className="fine">Children connect earning, saving, spending and sharing into one big picture.</figcaption>
            </figure>
          </div>
          <SectionCta links={[CTA.impact, CTA.partner]} />
        </div>
      </section>

      <Partners />

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
