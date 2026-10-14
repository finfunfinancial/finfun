import Link from "next/link";
import Img from "@/components/Img";
import { CTA, Classroom, Comparison, ImpactBand, JoinBanner, JsonLd, Outcomes, Partners, PathRow, ProgramCard, SectionCta, SectionHead, Spotlight, WaysToJoin } from "@/components/Sections";
import PostCard from "@/components/PostCard";
import Testimonials from "@/components/Testimonials";
import { festiveOffer, howItWorks, methods, programs, site, values } from "@/lib/content";
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
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">{site.grades} · Ages 8–16</span>
            <h1>
              Building financially <span className="mark">curious, confident and capable</span>
            </h1>
            <p className="lead">Children build lifelong money habits — budgeting, saving, staying safe online and investing — through games, quizzes and challenges they actually enjoy.</p>
            <div className="btn-row">
              <Link className="btn btn-blue btn-lg" href="/programs" data-track="path_courses">
                Find a course <span aria-hidden="true">→</span>
              </Link>
              {festiveOffer.active && (
                <Link className="btn btn-lg btn-festive" href={`/enrol?coupon=${festiveOffer.code}`} data-track="festive_click">
                  🎉 Festive offer{festiveOffer.discount && `: ${festiveOffer.discount} off`}
                </Link>
              )}
            </div>
            <p className="hero-note">Trusted by 35,000+ schools across India · <Link href="/schools">For schools</Link></p>
          </div>
          <Img
            className="art hero-art"
            src="/a/redesign/hero.webp"
            alt="A child at a sign saying Today, thinking about smart choices, at the start of a path past signs for Save, Learn, Invest and Grow towards a sun labelled Brighter money tomorrows"
            priority
            sizes="(max-width: 860px) 90vw, 540px"
          />
        </div>
      </section>

      <ImpactBand />

      <section className="section" aria-labelledby="t-h">
        <div className="wrap quotes-stage">
          <SectionHead eyebrow="Testimonials" title={<span id="t-h">What schools, officials and parents <span className="mark">say</span></span>} />
          <Img className="art quotes-fig l" src="/a/redesign/quote-official.webp" alt="" sizes="160px" loading="lazy" />
          <Img className="art quotes-fig r" src="/a/redesign/quote-parent.webp" alt="" sizes="160px" loading="lazy" />
          <Testimonials />
        </div>
      </section>

      <Spotlight />

      <section className="section" aria-labelledby="why-h">
        <div className="wrap">
          <SectionHead eyebrow="Why FinFun" title={<span id="why-h">Skills school doesn’t teach,<br />but <span className="mark">life does</span></span>} />
          <PathRow items={values} />
          <SectionCta links={[CTA.programs, CTA.partner]} />
        </div>
      </section>

      <Comparison />

      <section className="section" aria-labelledby="how-h">
        <div className="wrap">
          <SectionHead eyebrow="How it works" title={<span id="how-h">Small steps.<br /><span className="mark">Big money habits.</span></span>} />
          <PathRow items={howItWorks} />
          <SectionCta links={[CTA.enrol, CTA.demo]} />
        </div>
      </section>

      <section className="section" aria-labelledby="methods-h">
        <div className="wrap">
          <SectionHead eyebrow="Gamified learning" title={<span id="methods-h">Four ways teens <span className="mark">learn</span> with FinFun</span>} />
          <PathRow items={methods} />
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
          <SectionHead eyebrow="Student outcomes" title={<span id="out-h">From confusion to <span className="mark">confidence</span></span>}>
            Practical money skills, better habits and a confident outlook for life.
          </SectionHead>
          <Outcomes />
          <SectionCta links={[CTA.impact, CTA.partner]} />
        </div>
      </section>

      <Partners />

      <section className="section" aria-labelledby="blog-h">
        <div className="wrap">
          <SectionHead eyebrow="From the blog" title={<span id="blog-h">Money tips teens <span className="mark">actually read</span></span>}>
            Simple, practical and real stories — written for curious teens.
          </SectionHead>
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
