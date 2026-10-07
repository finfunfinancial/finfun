import Link from "next/link";
import type { ReactNode } from "react";
import { classroom, comparison, impact, partners, rubric, rubricLevels, spotlight, waysToJoin, type Program } from "@/lib/content";
import { Arrow, Dots, ScribbleCircle, Spark } from "./Doodles";
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
  enrol: { label: "Enroll your teen", href: "/enrol" },
  programs: { label: "See programs & prices", href: "/programs" },
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

export function ImpactBand({ title = "Our impact so far", cta = [{ ...CTA.impact, tone: "yellow" }] }: { title?: string; cta?: CtaLink[] | null }) {
  return (
    <section className="impact section tight" aria-labelledby="impact-h">
      <div className="wrap">
        <h2 id="impact-h">{title}</h2>
        <div className="grid g4">
          {impact.map((s) => (
            <div className="stat" key={s.label}>
              <Img src={s.icon} alt="" sizes="76px" />
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

export function Partners({ cta = [CTA.partner] }: { cta?: CtaLink[] | null } = {}) {
  return (
    <section className="section tight bg-white" aria-labelledby="partners-h">
      <div className="wrap">
        <SectionHead title={<span id="partners-h">Trusted by governments, CSR leaders and schools</span>} />
        <ul className="partners" role="list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {partners.map((p) => (
            <li className="partner" key={p.name}>
              <span className="logo-coin" aria-hidden="true">★</span>
              <span>
                {p.name}
                <small>{p.note}</small>
              </span>
            </li>
          ))}
        </ul>
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

export function Classroom({ cta = [CTA.demo, CTA.enrol] }: { cta?: CtaLink[] | null } = {}) {
  return (
    <section className="section" aria-labelledby="class-h">
      <div className="wrap">
        <SectionHead eyebrow="Inside the classroom" title={<span id="class-h">This is what learning money looks like</span>} />
        <div className="polaroids">
          {classroom.map((c) => (
            <figure className="polaroid" key={c.caption}>
              <div className="ph" style={{ background: c.bg }}>
                <Img src={c.sticker} alt="" sizes="220px" loading="lazy" />
              </div>
              <figcaption>{c.caption}</figcaption>
            </figure>
          ))}
        </div>
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

export function JoinBanner({ title = "Ready to become money smart?", text = "Bring FinFun to your school, or enroll your teen today.", audience = "both" }: { title?: string; text?: string; audience?: "both" | "parents" | "schools" }) {
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
        <div className="price">
          {inr(p.price)} <small>per student</small>
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
  return (
    <section className="section tight" aria-label="Featured testimonial">
      <div className="wrap">
        <figure className="spotlight">
          <Img src={spotlight.avatar} alt="" sizes="120px" loading="lazy" />
          <div>
            <p className="spotlight-head">“{spotlight.headline}”</p>
            <blockquote>{spotlight.quote}</blockquote>
            <figcaption>
              <strong>{spotlight.name}</strong> · {spotlight.role}
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
    <section className="section bg-white" aria-labelledby="cmp-h">
      <div className="wrap">
        <div className="sk-head">
          <span className="eyebrow">Why it works</span>
          <h2 id="cmp-h">
            <Spark className="sk-spark l" />
            <span className="sk-big">Difference</span>
            <Spark className="sk-spark r" />
            <span className="sk-between">between a typical money lesson and FinFun</span>
          </h2>
          <div className="sk-labels" aria-hidden="true">
            <div className="sk-label">
              <Img src="/a/sticker/06-rupi-thinks.webp" alt="" sizes="90px" loading="lazy" />
              <span className="sk-tag">Typical lesson</span>
            </div>
            <Arrow className="sk-arrow l" />
            <Arrow className="sk-arrow r" />
            <div className="sk-label fun">
              <span className="sk-tag">FinFun session</span>
              <Img src="/a/sticker/05-rupi-approves.webp" alt="" sizes="120px" loading="lazy" />
            </div>
          </div>
        </div>
        <div className="sketch-table" role="table" aria-label="Typical money lesson compared with FinFun">
          <div className="st-row st-head" role="row">
            <span role="columnheader">Aspect</span>
            <span role="columnheader">Typical lesson</span>
            <span role="columnheader">FinFun</span>
          </div>
          {comparison.rows.map((r) => (
            <div className="st-row" role="row" key={r.aspect}>
              <span role="rowheader">{r.aspect}</span>
              <span role="cell" className="st-old">{r.old}</span>
              <span role="cell" className="st-fun">{r.fun}</span>
            </div>
          ))}
        </div>
        {cta && <SectionCta links={cta} />}
      </div>
    </section>
  );
}

export function WaysToJoin() {
  return (
    <section className="section bg-yellow doodle" aria-labelledby="join-h">
      <div className="wrap">
        <SectionHead eyebrow="Get involved" title={<span id="join-h">Four ways to join FinFun</span>} />
        <div className="grid g4">
          {waysToJoin.map((w) => (
            <div className={`card way way-${w.color}`} key={w.title}>
              <span className="way-kicker">{w.kicker}</span>
              <h3>{w.title}</h3>
              <p className="way-who">{w.who}</p>
              <p>{w.text}</p>
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
    <section className="section" aria-labelledby="rubric-h">
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
