import type { Metadata } from "next";
import Link from "next/link";
import { PartnershipForm, ReportForm } from "@/components/Forms";
import Img from "@/components/Img";
import { CTA, Comparison, Faq, ImpactBand, JsonLd, PageHero, Partners, Rubric, SectionCta, SectionHead, Spotlight, faqJsonLd } from "@/components/Sections";
import Testimonials from "@/components/Testimonials";
import { journey, partnershipSteps, schoolFaq } from "@/lib/content";

export const metadata: Metadata = {
  title: "Financial literacy program for schools",
  description: "Bring FinFun’s gamified financial literacy program to your school. Teacher training, learning kits, competitions and an impact report for grades 6 to 10.",
  alternates: { canonical: "/schools" },
};

export default function Schools() {
  return (
    <>
      <JsonLd data={faqJsonLd(schoolFaq)} />
      <PageHero
        eyebrow="For principals, trustees & CSR partners"
        title={<>Bring financial literacy to <span className="mark">your school</span></>}
        lead="A ready-to-run program for grades 6 to 10 — trained teachers, learning kits, competitions and measurable impact. Already in 35,000+ schools."
        art="/a/sticker/07-money-coach.webp"
        tone="bg-sky"
      >
        <div className="btn-row">
          <Link className="btn btn-blue btn-lg" href="#partner" data-track="partner_click">
            Partner with us
          </Link>
          <Link className="btn btn-white btn-lg" href="#report">
            Get the impact report
          </Link>
        </div>
      </PageHero>

      <section className="section" aria-labelledby="gets-h">
        <div className="wrap">
          <SectionHead eyebrow="The FinFun Journey" title={<span id="gets-h">What your school gets</span>}>
            Everything needed to run financial literacy well — for students and teachers.
          </SectionHead>
          <div className="grid g5">
            {journey.map((j) => (
              <div className="card icon-card" key={j.title} style={{ padding: 18 }}>
                <Img src={j.icon} alt="" sizes="96px" loading="lazy" style={{ width: 96 }} />
                <h3 style={{ fontSize: "1.15rem" }}>{j.title}</h3>
                <p style={{ fontSize: "0.95rem" }}>{j.text}</p>
              </div>
            ))}
          </div>
          <SectionCta links={[CTA.partner, CTA.report]} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="steps-h">
        <div className="wrap">
          <SectionHead eyebrow="How partnership works" title={<span id="steps-h">Partner&nbsp;→ Train&nbsp;→ Play&nbsp;→ Measure</span>} />
          <div className="steps">
            {partnershipSteps.map((s, i) => (
              <div className="card step" key={s.title}>
                <span className="step-num">{i + 1}</span>
                <Img src={s.icon} alt="" sizes="130px" loading="lazy" />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <SectionCta links={[CTA.demo]} />
        </div>
      </section>

      <Rubric />
      <Comparison cta={[CTA.demo, CTA.report]} />
      <ImpactBand title="Proven at scale" />
      <Spotlight cta={[CTA.partner]} />
      <Partners />

      <section className="section" aria-labelledby="off-h">
        <div className="wrap">
          <SectionHead eyebrow="From our partners" title={<span id="off-h">Hear it from officials and school leaders</span>} />
          <Testimonials groups={["official", "school", "teacher"]} />
          <SectionCta links={[CTA.partner]} />
        </div>
      </section>

      <section id="report" className="section bg-yellow" aria-labelledby="report-h">
        <div className="wrap split">
          <Img className="banner-img" src="/a/impact/impact-report-cover-A4.webp" alt="Cover of the FinFun impact report" sizes="(max-width: 860px) 80vw, 420px" loading="lazy" style={{ maxWidth: 380, justifySelf: "center" }} />
          <div className="card">
            <h2 id="report-h">Download the impact report</h2>
            <p className="muted">Outcomes, savings data and case studies from FinFun schools. Enter your email and we’ll send it over.</p>
            <ReportForm />
          </div>
        </div>
      </section>

      <section id="partner" className="section" aria-labelledby="form-h">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div>
            <SectionHead left eyebrow="Partner with us" title={<span id="form-h">Let’s bring FinFun to your students</span>}>
              Tell us about your school or organisation. Our partnerships team replies within 2 working days.
            </SectionHead>
            <Faq items={schoolFaq} />
          </div>
          <div className="card">
            <PartnershipForm />
          </div>
        </div>
      </section>
    </>
  );
}
