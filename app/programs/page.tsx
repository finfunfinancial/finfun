import type { Metadata } from "next";
import Link from "next/link";
import Img from "@/components/Img";
import { CTA, JoinBanner, PageHero, ProgramCard, SectionCta, SectionHead, inr } from "@/components/Sections";
import { programs, type Program } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programs: Basic (grades 3–5), Pro (grades 6–7) and Advantage (grades 8–10)",
  description: "Compare FinFun Basic, Pro and Advantage — topics, grades, format and price. Gamified money skills for grades 3 to 10.",
  alternates: { canonical: "/programs" },
};

export default function Programs() {
  const rows: [string, (p: Program) => string][] = [
    ["Grades", (p) => p.grades],
    ["Focus", (p) => p.focus],
    ["Format", (p) => p.format[0]],
    ["Activities", (p) => p.format[1]],
    ["Price", (p) => inr(p.price)],
  ];
  return (
    <>
      <PageHero eyebrow="Programs" title={<>Three programs. <span className="mark">One goal.</span></>} lead="Money-smart kids. Pick the program that matches your child’s grade." art="/a/sticker/12-money-fun.webp" />
      <section className="section">
        <div className="wrap">
          <div className="grid g2">
            {programs.map((p) => (
              <ProgramCard key={p.slug} p={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-white" aria-labelledby="cmp-h">
        <div className="wrap">
          <SectionHead title={<span id="cmp-h">Compare side by side</span>} />
          <div className="card" style={{ overflowX: "auto", padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ background: "var(--yellow-soft)" }}>
                  <th scope="col" style={th}><span className="sr-only">Feature</span></th>
                  {programs.map((p) => (
                    <th scope="col" style={th} key={p.slug}><Link href={`/programs/${p.slug}`}>{p.name}</Link></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, cell]) => (
                  <tr key={k}>
                    <th scope="row" style={{ ...td, fontWeight: 800 }}>{k}</th>
                    {programs.map((p) => (
                      <td style={td} key={p.slug}>{cell(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SectionCta links={[{ label: "Enroll in Basic", href: "/enrol?program=basic" }, { label: "Enroll in Pro", href: "/enrol?program=pro", tone: "yellow" }, { label: "Enroll in Advantage", href: "/enrol?program=advantage", tone: "white" }]} />
        </div>
      </section>
      <section className="section" aria-labelledby="kit-h">
        <div className="wrap split">
          <Img className="banner-img" src="/a/about-and-programs/learning-kit-illustration-1200x800.webp" alt="Illustration of the FinFun learning kit: money cards, a board game and a money stories book" sizes="(max-width: 860px) 90vw, 560px" loading="lazy" />
          <div>
            <SectionHead left eyebrow="Included" title={<span id="kit-h">Every program comes with a learning kit</span>}>
              Money cards, games and story sheets that turn every session into play — and keep the learning going at home.
            </SectionHead>
            <SectionCta links={[CTA.enrol]} />
          </div>
        </div>
      </section>
      <JoinBanner audience="parents" />
    </>
  );
}

const th = { textAlign: "left" as const, padding: "16px 18px", borderBottom: "3px solid var(--ink)", fontFamily: "var(--font-hand)", fontSize: "1.3rem", fontWeight: 400 };
const td = { textAlign: "left" as const, padding: "14px 18px", borderBottom: "2px solid #eee", verticalAlign: "top" as const };
