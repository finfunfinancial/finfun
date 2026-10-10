import type { Metadata } from "next";
import Link from "next/link";
import Img from "@/components/Img";
import EnquiryForm from "@/components/lms/EnquiryForm";
import { ImpactBand, PageHero, Partners as PartnerList, SectionHead } from "@/components/Sections";
import Testimonials from "@/components/Testimonials";
import { partnerTypes, partnershipSteps } from "@/lib/content";

export const metadata: Metadata = {
  title: "Partner with FinFun: schools, NGOs, CSR and government",
  description: "Bring FinFun’s game-based money skills to more children through schools, NGOs and communities, CSR funding and government programs.",
  alternates: { canonical: "/partners" },
};

export default function PartnersPage() {
  return (
    <>
      <PageHero eyebrow="Partners" title={<>Bring FinFun to <span className="mark">more children</span></>} art="/a/sticker/10-share-give.webp" tone="bg-lavender"
        lead="Schools, NGOs, CSR teams and governments partner with FinFun to give every child money confidence." />

      <section className="section" aria-labelledby="ways-h">
        <div className="wrap">
          <SectionHead eyebrow="Ways to partner" title={<span id="ways-h">Choose how you’d like to work with us</span>} />
          <div className="grid g4">
            {partnerTypes.map((t) => (
              <div className="card stack" key={t.title}>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
                <Link className="btn btn-sm" href={t.href}>{t.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="path-h">
        <div className="wrap">
          <SectionHead eyebrow="Outreach pathway" title={<span id="path-h">How FinFun reaches a school or community</span>} />
          <div className="steps">
            {partnershipSteps.map((s, i) => (
              <div className="card step" key={s.title}>
                <span className="step-num">{i + 1}</span>
                <Img src={s.icon} alt="" sizes="100px" loading="lazy" />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ImpactBand title="Reach so far" />
      <PartnerList cta={null} />

      <section className="section" aria-labelledby="say-h">
        <div className="wrap">
          <SectionHead eyebrow="Public–private partnerships" title={<span id="say-h">What government and CSR partners say</span>} />
          <Testimonials groups={["official", "school"]} />
        </div>
      </section>

      <section className="section bg-white" aria-labelledby="enq-h" id="enquire">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <SectionHead title={<span id="enq-h">Start a partnership</span>}>Tell us who you are and what you have in mind. We reply within two working days.</SectionHead>
          <div className="portal">
            <EnquiryForm title="Partnership enquiry" topics={["partnership", "ngo", "government", "school"]} organisation submitLabel="Send enquiry" />
          </div>
        </div>
      </section>
    </>
  );
}
