"use client";
import Link from "next/link";
import { useState } from "react";
import { Notice } from "@/components/lms/ui";
import { lmsReady } from "@/lib/lms/auth";
import { supabase } from "@/lib/lms/supabase";
import { useAction } from "@/lib/lms/use-data";

export const TOPIC_LABELS: Record<string, string> = {
  parent: "I’m a parent",
  school: "I’m from a school",
  teacher: "Teacher training",
  trial: "Free demo class",
  partnership: "CSR or partnership",
  ngo: "NGO or community group",
  government: "Government",
  contest: "FinFun Fest / contests",
  other: "Something else",
};

type Props = {
  title: string;
  topics: (keyof typeof TOPIC_LABELS)[]; // first one is the default; one topic hides the picker
  grade?: boolean; // ask for the child's grade (free demo class)
  preferredTime?: boolean; // ask when suits them (free demo class)
  organisation?: boolean; // ask for the school / NGO / company name
  submitLabel?: string;
  done?: string;
};

/** Every website enquiry (contact, free demo class, teachers, partners, contests). Saved to Supabase
 *  `contact_requests`: anyone can send, only admins can read — they follow up in Admin → Contact requests. */
export default function EnquiryForm({ title, topics, grade, preferredTime, organisation, submitLabel = "Send", done = "Thanks — we’ll get back to you within one working day." }: Props) {
  const [sent, setSent] = useState(false);
  const { busy, error, run } = useAction();

  if (!lmsReady) return null;
  if (sent) {
    return (
      <div className="card stack" role="status">
        <h2 style={{ margin: 0 }}>Thank you!</h2>
        <p style={{ margin: 0 }}>{done} For anything urgent, WhatsApp us.</p>
        <button className="link" style={{ justifySelf: "start" }} onClick={() => setSent(false)}>Send another</button>
      </div>
    );
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    run(async () => {
      if (f.get("website")) return setSent(true); // honeypot: bots fill hidden fields; pretend it worked
      const email = String(f.get("email")).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address.");
      const text = (k: string) => String(f.get(k) ?? "").trim() || null;
      const { error } = await supabase.from("contact_requests").insert({
        name: text("name"),
        email,
        phone: text("phone"),
        topic: f.get("topic") ?? topics[0],
        message: text("message") ?? TOPIC_LABELS[String(f.get("topic") ?? topics[0])],
        child_grade: grade ? Number(f.get("grade")) : null,
        preferred_time: preferredTime ? text("preferred_time") : null,
        organisation: organisation ? text("organisation") : null,
      });
      if (error) throw new Error("We couldn’t send that just now. Please try again, or WhatsApp us.");
      form.reset();
      setSent(true);
    });
  };

  return (
    <form className="card stack" onSubmit={submit}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div className="fields">
        <label>Your name<input name="name" maxLength={100} autoComplete="name" required /></label>
        <label>Email<input name="email" type="email" maxLength={200} autoComplete="email" required /></label>
        <label>Phone {grade ? "" : "(optional)"}<input name="phone" type="tel" maxLength={20} autoComplete="tel" required={!!grade} /></label>
        {topics.length > 1 && (
          <label>About
            <select name="topic" defaultValue={topics[0]}>{topics.map((t) => <option key={t} value={t}>{TOPIC_LABELS[t]}</option>)}</select>
          </label>
        )}
        {organisation && <label>School or organisation<input name="organisation" maxLength={200} autoComplete="organization" /></label>}
        {grade && (
          <label>Child’s grade
            <select name="grade" defaultValue={6}>{[3, 4, 5, 6, 7, 8, 9, 10].map((g) => <option key={g} value={g}>Grade {g}</option>)}</select>
          </label>
        )}
        {preferredTime && <label>Best days / times<input name="preferred_time" maxLength={100} placeholder="e.g. Saturday morning" /></label>}
      </div>
      <label>Message {grade ? "(optional)" : ""}<textarea name="message" maxLength={2000} rows={4} required={!grade} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <p className="fine" style={{ margin: 0 }}>We only use these details to reply to you. See our <Link href="/privacy">privacy policy</Link>.</p>
      <Notice kind="error">{error}</Notice>
      <button className="btn blue lg" disabled={busy}>{busy ? "Sending…" : submitLabel}</button>
    </form>
  );
}
