import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { comparison, impact, joinSteps, outcomes, partners, rubric, rubricLevels, spotlight, waysToJoin, type Program } from "@/lib/content";
import { Dots, ScribbleCircle } from "./Doodles";
import Img from "./Img";

export type CtaLink = { label: string; href: string; tone?: "blue" | "yellow" | "white" };

const trackFor = (href: string) => (href.startsWith("/enrol") ? "enrol_click" : href.includes("#partner") ? "partner_click" : "cta_click");

/** Centered button row that closes a section, so every screen ends with a next step. */
export function SectionCta({ links }: { links: CtaLink[] }) {
  return (
    <div className="section-cta">
      {links.map((l, i) => (
        <Link key={l.href + l.label} className={`btn ${l.tone === "white" ? "btn-white" : l.tone === "yellow" || (!l.tone && i > 0) ? "" : "btn-blue"}`} href={l.href} data-track={trackFor(l.href)}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export const CTA = {
  partner: { label: "Partner with us", href: "/schools#partner" },
  demo: { label: "Request a demo", href: "/schools#partner" },
  enrol: { label: "Enroll your child", href: "/enrol" },
  trial: { label: "Try a free lesson", href: "/try" },
  programs: { label: "See courses & prices", href: "/programs" },
  impact: { label: "See our full impact", href: "/impact" },
  report: { label: "Get the impact report", href: "/schools#report" },
} satisfies Record<string, CtaLink>;

export function SectionHead({ eyebrow, title, children, left }: { eyebrow?: string; title: ReactNode; children?: ReactNode; left?: boolean }) {
  return (
    <div className={`section-head${left ? " left" : ""}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, lead, art, artAlt = "", children, tone = "bg-yellow" }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; art?: string; artAlt?: string; children?: ReactNode; tone?: string }) {
  return (
    <section className={`page-hero doodle ${tone}`}>
      <div className="wrap page-hero-grid">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          {children}
        </div>
        {art && <Img className="page-hero-art sticker" src={art} alt={artAlt} priority sizes="360px" />}
      </div>
    </section>
  );
}

export function ImpactBand({ title = <>Our <span className="mark">impact</span> so far</>, cta = [{ ...CTA.impact, tone: "yellow" }] }: { title?: ReactNode; cta?: CtaLink[] | null }) {
  return (
    <section className="section tight" aria-labelledby="impact-h">
      <div className="wrap">
        <SectionHead title={<span id="impact-h">{title}</span>} />
        <ul className="impact-row" role="list">
          {impact.map((s) => (
            <li key={s.label}>
              <Img className="art" src={s.art} alt="" sizes="160px" loading="lazy" />
              <span className={`impact-pill tone-${s.tone}`}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </span>
            </li>
          ))}
        </ul>
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

export function Partners({ cta = [CTA.partner] }: { cta?: CtaLink[] | null } = {}) {
  return (
    <section className="section tight" aria-labelledby="partners-h">
      <div className="wrap">
        <SectionHead title={<span id="partners-h"><span className="mark">Trusted</span> by schools, parents, government and CSR leaders</span>} />
        <ul className="partner-cards" role="list">
          {partners.map((p) => (
            <li className="partner-card" key={p.name}>
              <Img className="art" src={p.art} alt="" sizes="(max-width: 600px) 50vw, 210px" loading="lazy" />
              <div>
                <span className="logo-coin" aria-hidden="true">★</span>
                <span>
                  {p.name}
                  <small>{p.note}</small>
                </span>
              </div>
            </li>
          ))}
        </ul>
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

export function Classroom({ cta = [{ ...CTA.demo, tone: "white" }, { ...CTA.enrol, tone: "yellow" }] }: { cta?: CtaLink[] | null } = {}) {
  return (
    <section className="section" aria-labelledby="class-h">
      <div className="wrap">
        <SectionHead eyebrow="Inside the classroom" title={<span id="class-h">This is what <span className="mark">learning money</span> looks like</span>}>
          Real topics. Real skills. Real life. Explained simply for curious teens.
        </SectionHead>
      </div>
      <div className="classroom-desk">
        <Img
          className="art"
          src="/a/redesign/classroom-banner.webp"
          alt="Notes pinned above a desk: Spot scams, Stay safe online, Budget like a pro, Set goals and save, Explore investing — beside books labelled Spend, Save, Grow and a notebook titled Money Skills for Real Life"
          sizes="(max-width: 1200px) 100vw, 1160px"
          loading="lazy"
        />
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

export function JoinBanner({ title = "Ready to become money smart?", text = "Bring FinFun to your school, or enroll your child today.", audience = "both" }: { title?: string; text?: string; audience?: "both" | "parents" | "schools" }) {
  return (
    <section className="section tight cta-band">
      <Dots className="cta-dots" />
      <div className="wrap cta-grid">
        <div className="cta-text">
          <ScribbleCircle className="cta-circle" />
          <h2>{title}</h2>
          <p>{text}</p>
          <div className="btn-row">
            {audience !== "parents" && (
              <Link className="btn btn-blue btn-lg" href={audience === "schools" ? "/schools#partner" : "/schools"} data-track="partner_click">
                {audience === "schools" ? "Partner with us" : "For Schools"}
              </Link>
            )}
            {audience !== "schools" && (
              <Link className="btn btn-lg" href={audience === "parents" ? "/enrol" : "/parents"} data-track="enrol_click">
                {audience === "parents" ? "Enroll now" : "For Parents"}
              </Link>
            )}
          </div>
        </div>
        <LetsLockup />
      </div>
    </section>
  );
}

/** Rupi the coin mascot with a hand-lettered “let’s get money smart”. */
export function LetsLockup({ small }: { small?: boolean }) {
  return (
    <div className={`lockup${small ? " small" : ""}`} aria-hidden="true">
      <div className="lockup-art">
        <Img className="sticker" src="/a/sticker/10-hi-im-rupi.webp" alt="" sizes="220px" loading="lazy" />
      </div>
      <p className="lockup-word">
        <span className="lets">let’s</span> <span className="loud">GET MONEY SMART</span>
      </p>
    </div>
  );
}

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

/** A price with the ₹ sign given more weight than the amount, and the unit spelled out: “₹1,499 per child”. */
export function Price({ amount, unit = "per child", className = "" }: { amount: number; unit?: string; className?: string }) {
  return (
    <span className={`price ${className}`}>
      <span className="rupee" aria-hidden="true">₹</span>
      <span className="sr-only">Rupees </span>
      {amount.toLocaleString("en-IN")} {unit && <small>{unit}</small>}
    </span>
  );
}

/** Courses → Program → Payment, with the current step highlighted. */
export function JoinSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <nav className="join-steps" aria-label="How to join FinFun">
      <ol>
        {joinSteps.map((s, i) => (
          <li key={s.title} className={i === current ? "now" : i < current ? "done" : ""} aria-current={i === current ? "step" : undefined}>
            <Link href={s.href}>
              <span className="js-num">{i < current ? "✓" : i + 1}</span>
              <span>
                <strong>{s.title}</strong>
                <small>{s.text}</small>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ProgramCard({ p, detail = true }: { p: Program; detail?: boolean }) {
  return (
    <article className="card program">
      <div className={`program-top ${p.slug}`}>
        <div>
          <span className="chip">{p.grades}</span>
          <h3 style={{ margin: "12px 0 16px", fontSize: "2rem" }}>{p.name}</h3>
        </div>
        <Img src={p.sticker} alt="" sizes="220px" loading="lazy" />
      </div>
      <div className="program-body">
        <p style={{ margin: 0 }}>{p.focus}</p>
        <ul className="ticks">
          {p.format.slice(0, 3).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <div>
          <Price amount={p.price} />
        </div>
        <div className="btn-row">
          <Link className="btn btn-blue" href={`/enrol?program=${p.slug}`} data-track="enrol_click">
            Enroll in {p.name.replace("FinFun ", "")}
          </Link>
          {detail && (
            <Link className="btn btn-white" href={`/programs/${p.slug}`}>
              See what’s inside
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <div>{f.a}</div>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Spotlight({ cta = [CTA.partner, CTA.report] }: { cta?: CtaLink[] | null } = {}) {
  const [lead, amount] = spotlight.headline.split(/(?=₹)/); // highlight the rupee amount
  return (
    <section className="section tight" aria-label="Featured testimonial">
      <div className="wrap">
        <figure className="spotlight">
          <Img className="art" src="/a/redesign/spotlight-saver.webp" alt="" sizes="200px" loading="lazy" />
          <div>
            <p className="spotlight-head">
              <span className="q" aria-hidden="true">“</span>
              {lead}
              {amount && <span className="mark">{amount}</span>}
              <span className="q" aria-hidden="true">”</span>
            </p>
            <blockquote>{spotlight.quote}</blockquote>
            <figcaption>
              <Img src={spotlight.avatar} alt="" sizes="48px" loading="lazy" />
              <span>
                <strong>{spotlight.name}</strong>
                {spotlight.role}
              </span>
            </figcaption>
          </div>
        </figure>
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

export function Comparison({ cta = [CTA.demo, CTA.enrol] }: { cta?: CtaLink[] | null } = {}) {
  return (
    <section className="section" aria-labelledby="cmp-h">
      <div className="wrap">
        <SectionHead eyebrow="Why it works" title={<span id="cmp-h">Same goal.<br />A <span className="mark">better path</span>.</span>} />
        <div className="better-path">
          <div className="bp-side">
            <Img className="art" src="/a/redesign/diff-typical.webp" alt="" sizes="180px" loading="lazy" />
            <div>
              <h3>Typical money lesson</h3>
              <ul className="bp-list" role="list">
                {comparison.typical.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
          <div className="bp-side fun">
            <Img className="art" src="/a/redesign/diff-finfun.webp" alt="" sizes="240px" loading="lazy" />
            <div>
              <h3>FinFun session</h3>
              <ul className="bp-list" role="list">
                {comparison.finfun.map((f) => (
                  <li key={f.text}>
                    <Img className="art" src={f.icon} alt="" sizes="40px" loading="lazy" />
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

/** Figures walking along one hand-drawn path (each item's art is a slice of it), with a coloured label and line below. */
export function PathRow({ items }: { items: { title: string; text: string; art: string; tone: string }[] }) {
  return (
    <ul className="path-row" role="list" style={{ "--n": items.length } as CSSProperties}>
      {items.map((it) => (
        <li key={it.title}>
          <Img className="art" src={it.art} alt="" sizes="(max-width: 700px) 90vw, 330px" loading="lazy" />
          <h3 className={`tag tone-${it.tone}`}>{it.title}</h3>
          <p>{it.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Student outcomes: before, with and after FinFun. */
export function Outcomes() {
  return (
    <div className="grid g3">
      {outcomes.map((o) => (
        <div className="card outcome" key={o.tag}>
          <h3 className={`tag tone-${o.tone}`}>{o.tag}</h3>
          <Img className="art" src={o.art} alt="" sizes="240px" loading="lazy" />
          <ul className={`checks${o.good ? "" : " bad"}`} role="list">
            {o.points.map((pt) => <li key={pt}>{pt}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function WaysToJoin() {
  return (
    <section className="section" aria-labelledby="join-h">
      <div className="wrap">
        <SectionHead eyebrow="Get involved" title={<span id="join-h">Four ways to <span className="mark">join FinFun</span></span>} />
        <div className="grid g4">
          {waysToJoin.map((w) => (
            <div className="card way" key={w.title}>
              <Img className="art" src={w.art} alt="" sizes="220px" loading="lazy" />
              <span className={`tag tone-${w.color}`}>{w.kicker}</span>
              <h3>{w.title}</h3>
              <p>{w.who}</p>
              <Link className="btn btn-sm" href={w.href}>{w.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Rubric() {
  return (
    <section className="section" aria-labelledby="rubric-h" id="rubric">
      <div className="wrap">
        <SectionHead eyebrow="How we measure" title={<span id="rubric-h">A rubric built for children</span>}>
          Every child is assessed on four money skills through games and challenges. Teachers mark each skill at one of three levels, and your school gets a class-wide report.
        </SectionHead>
        <ol className="rubric-levels" aria-label="Levels">
          {rubricLevels.map((l) => (
            <li key={l.name}>
              <Img src={l.medal} alt="" sizes="40px" loading="lazy" />
              <strong>{l.name}</strong> {l.label}
            </li>
          ))}
        </ol>
        <div className="grid rubric-grid">
          {rubric.map((r) => (
            <article className="card rubric" key={r.skill}>
              <h3>
                <Img src={r.badge} alt="" sizes="64px" loading="lazy" />
                {r.skill}
              </h3>
              <ol>
                {r.levels.map((text, i) => (
                  <li key={rubricLevels[i].name}>
                    <Img src={rubricLevels[i].medal} alt="" sizes="32px" loading="lazy" />
                    <span>
                      <strong>{rubricLevels[i].name}:</strong> {text}
                    </span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
