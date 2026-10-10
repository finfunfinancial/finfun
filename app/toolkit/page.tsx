import type { Metadata } from "next";
import Img from "@/components/Img";
import { CTA, JoinBanner, PageHero, SectionCta, SectionHead } from "@/components/Sections";
import { toolkit } from "@/lib/content";

export const metadata: Metadata = {
  title: "The FinFun Toolkit for children",
  description: "Lucky Ledger 2.0, board games, card games, a finance journal, money stories and activity sheets — FinFun’s toolkit for learning money through play.",
  alternates: { canonical: "/toolkit" },
};

export default function Toolkit() {
  const [featured, ...rest] = toolkit;
  return (
    <>
      <PageHero eyebrow="FinFun Toolkit" title={<>Money skills you can <span className="mark">play</span></>} art="/a/sticker/12-money-fun.webp" tone="bg-pink"
        lead="Games, journals and activity sheets that keep children learning money at home and in class." />

      <section className="section" aria-labelledby="ll-h">
        <div className="wrap">
          <div className="card highlight-banner featured-tool">
            <Img src={featured.img} alt="" sizes="160px" loading="lazy" style={{ width: 140 }} />
            <div>
              <span className="eyebrow">New</span>
              <h2 id="ll-h" style={{ margin: "8px 0" }}>{featured.title}</h2>
              <p style={{ margin: 0 }}>{featured.text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="kit-h">
        <div className="wrap">
          <SectionHead eyebrow="In the toolkit" title={<span id="kit-h">Board games, card games and more</span>}>
            Every FinFun course includes a learning kit, so practice carries on between classes.
          </SectionHead>
          <div className="grid g3">
            {rest.map((t) => (
              <div className="card topic-card" key={t.title}>
                <Img src={t.img} alt="" sizes="96px" loading="lazy" />
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
          <SectionCta links={[CTA.programs, { label: "Toolkit for your school", href: "/contact", tone: "white" }]} />
        </div>
      </section>
      <JoinBanner audience="parents" />
    </>
  );
}
