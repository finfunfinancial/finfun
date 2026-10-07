import type { Metadata } from "next";
import { PageHero } from "@/components/Sections";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Talk to FinFun: school partnerships, CSR programs and parent questions. Email partnerships@finfun.club or call +91 97398 85822.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <PageHero eyebrow="Contact" title={<>Let’s <span className="mark">talk money</span></>} art="/a/sticker/10-hi-im-rupi.webp" tone="bg-sky"
      lead={<>Email <a href={`mailto:${site.email}`}>{site.email}</a>, call <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>, or use the WhatsApp button any time.</>}
    />
  );
}
