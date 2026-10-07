import type { Metadata } from "next";
import Link from "next/link";
import Utility from "@/components/Utility";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

const copy: Record<string, [string, string]> = {
  partnership: ["Thanks — we’ll be in touch!", "Our partnerships team will contact you within 2 working days."],
  enrol: ["You’re almost in!", "We’ve saved your details. Our team will send the payment link and batch timings on WhatsApp and email shortly."],
};

export default async function ThankYou({ searchParams }: PageProps<"/thank-you">) {
  const { from } = await searchParams;
  const [title, text] = copy[String(from)] ?? ["Thank you!", "We got your message. We’ll get back to you soon."];
  return (
    <Utility img="/a/sticker/05-rupi-approves.webp" title={title}
      actions={<><Link className="btn btn-lg" href="/">Back to home</Link><Link className="btn btn-white btn-lg" href="/blog">Read money tips</Link></>}>
      <p>{text}</p>
    </Utility>
  );
}
