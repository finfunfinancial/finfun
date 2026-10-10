"use client";
import Link from "next/link";
import { useState } from "react";
import { Notice } from "@/components/lms/ui";
import { lmsReady } from "@/lib/lms/auth";
import { supabase } from "@/lib/lms/supabase";
import { useAction } from "@/lib/lms/use-data";

const TOPICS = [
  { value: "parent", label: "I’m a parent" },
  { value: "school", label: "I’m from a school" },
  { value: "partnership", label: "CSR or partnership" },
  { value: "other", label: "Something else" },
];

/** finfun.club/contact form. Saved to Supabase (contact_requests); admins follow up from Admin → Contact requests. */
export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const { busy, error, run } = useAction();

  if (!lmsReady) return null;
  if (sent) {
    return (
      <div className="card stack" role="status">
        <h2 style={{ margin: 0 }}>Thanks — message sent!</h2>
        <p style={{ margin: 0 }}>We usually reply within one working day. For anything urgent, WhatsApp us.</p>
        <button className="link" style={{ justifySelf: "start" }} onClick={() => setSent(false)}>Send another message</button>
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
      const { error } = await supabase.from("contact_requests").insert({
        name: String(f.get("name")).trim(),
        email,
        phone: String(f.get("phone")).trim() || null,
        topic: f.get("topic"),
        message: String(f.get("message")).trim(),
      });
      if (error) throw new Error("We couldn’t send that just now. Please try again, or WhatsApp us.");
      form.reset();
      setSent(true);
    });
  };

  return (
    <form className="card stack" onSubmit={submit}>
      <h2 style={{ margin: 0 }}>Send us a message</h2>
      <div className="fields">
        <label>Your name<input name="name" maxLength={100} autoComplete="name" required /></label>
        <label>Email<input name="email" type="email" maxLength={200} autoComplete="email" required /></label>
        <label>Phone (optional)<input name="phone" type="tel" maxLength={20} autoComplete="tel" /></label>
        <label>About
          <select name="topic" defaultValue="parent">{TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
        </label>
      </div>
      <label>Message<textarea name="message" maxLength={2000} rows={5} required /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <p className="fine" style={{ margin: 0 }}>We only use these details to reply to you. See our <Link href="/privacy">privacy policy</Link>.</p>
      <Notice kind="error">{error}</Notice>
      <button className="btn blue lg" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
    </form>
  );
}
