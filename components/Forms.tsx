"use client";

import Link from "next/link";
import { programs, getProgram } from "@/lib/content";
import LeadForm, { type Field } from "./LeadForm";

const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Other"];

const partnershipFields: Field[] = [
  { name: "name", label: "Your name", autoComplete: "name" },
  { name: "role", label: "Role", type: "select", options: ["Principal", "Trustee / Management", "Teacher", "CSR head", "Government / Education dept.", "Other"].map((v) => ({ value: v, label: v })) },
  { name: "organisation", label: "School or organisation", full: true, autoComplete: "organization" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", type: "select", options: STATES.map((v) => ({ value: v, label: v })) },
  { name: "students", label: "Number of students (grades 6–10)", type: "number" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "email", label: "Work email", type: "email", autoComplete: "email", full: true },
  { name: "message", label: "Anything we should know?", type: "textarea", required: false, full: true },
];

export function PartnershipForm() {
  return <LeadForm type="partnership" fields={partnershipFields} submitLabel="Request a call" />;
}

export function ReportForm() {
  return (
    <LeadForm
      type="report"
      submitLabel="Get the report"
      onSuccess={() => ""}
      fields={[
        { name: "name", label: "Name", autoComplete: "name" },
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "organisation", label: "Organisation", required: false, full: true },
      ]}
    />
  );
}

export function EnrolForm({ program, coupon }: { program?: string; coupon?: string }) {
  return (
    <LeadForm
      type="enrol"
      submitLabel="Continue to payment"
      onSuccess={(d) => getProgram(d.program)?.checkoutUrl || `/thank-you?from=enrol&program=${d.program}`}
      fields={[
        { name: "program", label: "Program", type: "select", full: true, defaultValue: getProgram(program ?? "") ? program : "", options: programs.map((p) => ({ value: p.slug, label: `${p.name} · ${p.grades} · ₹${p.price.toLocaleString("en-IN")}` })) },
        { name: "parentName", label: "Parent’s name", autoComplete: "name" },
        { name: "email", label: "Parent’s email", type: "email", autoComplete: "email" },
        { name: "phone", label: "Parent’s WhatsApp number", type: "tel", autoComplete: "tel", full: true },
        { name: "childName", label: "Child’s first name" },
        { name: "grade", label: "Child’s grade", type: "select", options: ["3", "4", "5", "6", "7", "8", "9", "10"].map((g) => ({ value: g, label: `Grade ${g}` })) },
        { name: "school", label: "School" },
        { name: "city", label: "City", autoComplete: "address-level2" },
        { name: "coupon", label: "Coupon code", required: false, full: true, defaultValue: coupon && /^[A-Za-z0-9-]{1,20}$/.test(coupon) ? coupon.toUpperCase() : undefined },
        {
          name: "consent",
          label: "Consent",
          type: "checkbox",
          full: true,
          checkboxLabel: (
            <>
              I am the parent or legal guardian of this child and I consent to FinFun using their name and grade to run the program, as described in the <Link href="/privacy">privacy policy</Link>.
            </>
          ),
        },
      ]}
      footer={<p className="fine">Secure payment by UPI, card or netbanking. You’ll get a confirmation on email and WhatsApp.</p>}
    />
  );
}
