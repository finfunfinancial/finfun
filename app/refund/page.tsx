import type { Metadata } from "next";
import Policy from "@/components/Policy";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Refund policy", alternates: { canonical: "/refund" } };

// TODO(FinFun): confirm the refund window before launch.
export default function Refund() {
  return (
    <Policy title="Refund policy" updated="30 September 2026">
      <p>We want every teen to enjoy FinFun. If it isn’t the right fit, here’s how refunds work.</p>
      <h2>Full refund</h2>
      <p>Request a refund within 7 days of your teen’s first session and we’ll refund the full amount.</p>
      <h2>After 7 days</h2>
      <p>We can move your teen to another batch or program instead. Refunds after this window are at our discretion.</p>
      <h2>How to ask</h2>
      <p>Email <a href={`mailto:${site.email}`}>{site.email}</a> or WhatsApp {site.phone} with the parent’s name and phone number used at enrollment. Refunds go back to the original payment method within 7–10 working days.</p>
    </Policy>
  );
}
