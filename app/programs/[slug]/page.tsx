import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Img from "@/components/Img";
import { Faq, JoinBanner, JsonLd, PageHero, SectionCta, SectionHead, faqJsonLd, inr } from "@/components/Sections";
import { getProgram, parentFaq, programs, site } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => programs.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const p = getProgram((await params).slug);
  if (!p) return {};
  return { title: `${p.name} — financial literacy for ${p.grades.toLowerCase()}`, description: `${p.name} (${p.grades}, ${inr(p.price)}): ${p.focus}`, alternates: { canonical: `/programs/${p.slug}` } };
}

export default async function ProgramPage({ params }: PageProps<"/programs/[slug]">) {
  const p = getProgram((await params).slug);
  if (!p) notFound();
  const others = programs.filter((x) => x.slug !== p.slug);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: p.name,
          description: p.focus,
          provider: { "@type": "Organization", name: "FinFun", sameAs: site.url },
          offers: { "@type": "Offer", price: p.price, priceCurrency: "INR", category: "Paid" },
        }}
      />
      <JsonLd data={faqJsonLd(parentFaq)} />
      <PageHero eyebrow={p.grades} title={p.name} lead={p.focus} art={p.sticker} tone={{ basic: "bg-pink", pro: "bg-sky", advantage: "bg-yellow" }[p.slug]}>
        <p className="price" style={{ marginBottom: 20 }}>
          {inr(p.price)} <small>per student</small>
        </p>
        <Link className="btn btn-blue btn-lg" href={`/enrol?program=${p.slug}`} data-track="enrol_click">
          Enroll in {p.name.replace("FinFun ", "")}
        </Link>
      </PageHero>

      <section className="section" aria-labelledby="inside-h">
        <div className="wrap">
          <SectionHead eyebrow="What’s inside" title={<span id="inside-h">Topics your teen will master</span>} />
          <div className="grid g3">
            {p.topics.map((t) => (
              <div className="card topic-card" key={t.title}>
                <Img src={t.sticker} alt="" sizes="96px" loading="lazy" />
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
          </div>
          <SectionCta links={[{ label: `Enroll in ${p.name.replace("FinFun ", "")}`, href: `/enrol?program=${p.slug}` }]} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="format-h">
        <div className="wrap split">
          <div>
            <SectionHead left eyebrow="Format & timings" title={<span id="format-h">How it runs</span>} />
            <ul className="ticks">
              {p.format.map((f) => (
                <li key={f}>{f}</li>
              ))}
              <li>Batch timings shared at enrollment — choose what fits your teen’s week</li>
            </ul>
            <SectionCta links={[{ label: "Enroll now", href: `/enrol?program=${p.slug}` }, { label: "Ask a question", href: "/contact", tone: "white" }]} />
          </div>
          <Img className="banner-img" src="/a/about-and-programs/learning-kit-illustration-1200x800.webp" alt="Sample of the FinFun learning kit" sizes="(max-width: 860px) 90vw, 560px" loading="lazy" />
        </div>
      </section>

      <section className="section" aria-labelledby="pfaq-h">
        <div className="wrap">
          <SectionHead eyebrow="FAQ" title={<span id="pfaq-h">Good to know</span>} />
          <Faq items={parentFaq} />
          <p className="center mt">
            Different grade? See{" "}
            {others.map((o, i) => (
              <span key={o.slug}>
                {i > 0 && " or "}
                <Link href={`/programs/${o.slug}`}>{o.name}</Link> ({o.grades.toLowerCase()})
              </span>
            ))}
            .
          </p>
        </div>
      </section>
      <JoinBanner audience="parents" title={`Enroll in ${p.name}`} text={`${p.grades} · ${inr(p.price)} · Pay by UPI, card or netbanking.`} />
    </>
  );
}
