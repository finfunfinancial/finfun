import type { Metadata } from "next";
import Policy from "@/components/Policy";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

// TODO(FinFun): legal review before launch (DPDP Act 2023).
export default function Privacy() {
  return (
    <Policy title="Privacy policy" updated="30 September 2026">
      <p>FinFun (“we”) runs financial literacy programs for students in grades 6 to 10. We take children’s privacy seriously and follow India’s Digital Personal Data Protection Act, 2023.</p>
      <h2>Who gives us data</h2>
      <p>Only parents, guardians and schools fill in forms or pay on this site. Students never sign up on their own; their accounts are created by a parent or school.</p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Parents:</strong> name, email, phone, city, and payment status (card and bank details are handled by our payment provider, not stored by us).</li>
        <li><strong>Children:</strong> only first name, grade and school — the minimum needed to run the program.</li>
        <li><strong>Schools and partners:</strong> contact name, role, organisation, location and student numbers.</li>
        <li><strong>Usage:</strong> anonymous analytics (Google Analytics, Meta Pixel) to understand which pages help visitors.</li>
      </ul>
      <h2>Parental consent</h2>
      <p>We process a child’s data only with verifiable consent from their parent or guardian, given at enrollment. Parents can withdraw consent at any time.</p>
      <h2>How we use it</h2>
      <p>To run sessions, share batch timings, send receipts and progress updates, and reply to questions. We never sell data, never show third-party ads, and never display children’s names or photos publicly without written parent consent.</p>
      <h2>Your rights</h2>
      <p>You can ask to see, correct or delete your or your child’s data by emailing <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </Policy>
  );
}
