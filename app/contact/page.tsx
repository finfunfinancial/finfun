import type { Metadata } from "next";
import EnquiryForm from "@/components/lms/EnquiryForm";
import { PageHero } from "@/components/Sections";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Talk to FinFun: school partnerships, CSR programs and parent questions. Email partnerships@finfun.club or call +91 97398 85822.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let’s <span className="mark">talk money</span></>} art="/a/sticker/10-hi-im-rupi.webp" tone="bg-sky"
        lead={<>Email <a href={`mailto:${site.email}`}>{site.email}</a>, call <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>, use the WhatsApp button, or send us a message below.</>}
      />
      <section className="section" aria-label="Contact form">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="portal">
            <EnquiryForm title="Send us a message" topics={["parent", "school", "teacher", "partnership", "ngo", "contest", "other"]} submitLabel="Send message" />
          </div>
        </div>
      </section>
    </>
  );
}
