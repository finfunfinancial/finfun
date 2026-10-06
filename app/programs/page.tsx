import type { Metadata } from "next";
import Link from "next/link";
import Img from "@/components/Img";
import { CTA, JoinBanner, PageHero, ProgramCard, SectionCta, SectionHead, inr } from "@/components/Sections";
import { programs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programs: Pro (grades 6–7) and Advantage (grades 8–10)",
  description: "Compare FinFun Pro and FinFun Advantage — topics, grades, format and price. Gamified money skills for teens in grades 6 to 10.",
  alternates: { canonical: "/programs" },
};

export default function Programs() {
  const [pro, adv] = programs;
  const rows: [string, string, string][] = [
    ["Grades", pro.grades, adv.grades],
    ["Focus", pro.focus, adv.focus],
    ["Format", pro.format[0], adv.format[0]],
    ["Activities", pro.format[1], adv.format[1]],
    ["Price", inr(pro.price), inr(adv.price)],
  ];
  return (
    <>
      <PageHero eyebrow="Programs" title={<>Two programs. <span className="mark">One goal.</span></>} lead="Money-smart teens. Pick the program that matches your teen’s grade." art="/a/sticker/12-money-fun.webp" />
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
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ background: "var(--yellow-soft)" }}>
                  <th scope="col" style={th}><span className="sr-only">Feature</span></th>
                  <th scope="col" style={th}><Link href="/programs/pro">{pro.name}</Link></th>
                  <th scope="col" style={th}><Link href="/programs/advantage">{adv.name}</Link></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, a, b]) => (
                  <tr key={k}>
                    <th scope="row" style={{ ...td, fontWeight: 800 }}>{k}</th>
                    <td style={td}>{a}</td>
                    <td style={td}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SectionCta links={[{ label: "Enroll in Pro", href: "/enrol?program=pro" }, { label: "Enroll in Advantage", href: "/enrol?program=advantage", tone: "yellow" }]} />
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
