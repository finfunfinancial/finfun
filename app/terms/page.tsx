import type { Metadata } from "next";
import Policy from "@/components/Policy";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

// TODO(FinFun): legal review before launch.
export default function Terms() {
  return (
    <Policy title="Terms of use" updated="30 September 2026">
      <p>By using finfun.club you agree to these terms.</p>
      <h2>Enrollment</h2>
      <p>Programs are purchased by a parent or guardian for a student in grades 6 to 10. The purchaser is responsible for the accuracy of the details provided.</p>
      <h2>Educational content</h2>
      <p>FinFun teaches general money concepts for educational purposes. Nothing on this site or in our sessions is personalised financial or investment advice.</p>
      <h2>Conduct</h2>
      <p>Students and parents agree to respectful behaviour in live sessions. We may remove anyone who disrupts a session or puts other students at risk.</p>
      <h2>Content ownership</h2>
      <p>FinFun materials, illustrations and kits are for personal and classroom use by enrolled students and partner schools only.</p>
      <h2>Contact</h2>
      <p>Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </Policy>
  );
}
