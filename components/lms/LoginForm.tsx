"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Notice } from "@/components/lms/ui";
import { homeFor, lmsReady, useMe } from "@/lib/lms/auth";
import { supabase } from "@/lib/lms/supabase";
import { useAction } from "@/lib/lms/use-data";

/** Sign up or log in with an email and a 6-digit code (Supabase Auth, email only) — a new email creates the account.
 *  Afterwards admins go to /admin and everyone else to `next` (e.g. back to checkout) or My courses. */
export default function LoginForm({ fallback }: { fallback: React.ReactNode }) {
  const me = useMe();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const home = me ? (me.role === "admin" ? "/admin" : next?.startsWith("/") ? next : homeFor(me.role)) : null;

  useEffect(() => {
    if (home && home !== "/") router.replace(home);
  }, [home, router]);

  if (!lmsReady) return <>{fallback}</>;

  return (
    <div className="portal">
      <div className="login">
        <div className="login-box">
          <div className="login-head">
            <img src="/a/sticker/10-hi-im-rupi.webp" alt="" width={110} height={110} />
            <h1>Log in or sign up</h1>
            <p className="muted">New here? Just enter your email — we’ll create your account.</p>
          </div>
          <div className="card">
            {me && home === "/" ? <Notice>This account doesn’t have access here. Please contact FinFun.</Notice> : <CodeLogin />}
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeLogin() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const { busy, error, run } = useAction();

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const address = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error("Please enter a valid email address.");
      const { error } = await supabase.auth.signInWithOtp({ email: address });
      if (error) throw new Error(error.status === 429 ? "Too many codes sent. Please wait a minute and try again." : error.message);
      setSentTo(address);
    });
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const { error } = await supabase.auth.verifyOtp({ email: sentTo!, token: code.trim(), type: "email" });
      if (error) throw new Error("That code isn’t right, or it has expired.");
    });
  };

  if (!sentTo) {
    return (
      <form className="stack" onSubmit={send}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
        </label>
        <Notice kind="error">{error}</Notice>
        <button className="btn blue lg" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button>
      </form>
    );
  }
  return (
    <form className="stack" onSubmit={verify}>
      <p>We emailed a 6-digit code to <strong>{sentTo}</strong>. Check your spam folder if it isn’t there in a minute.</p>
      <label>
        Code
        <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus />
      </label>
      <Notice kind="error">{error}</Notice>
      <button className="btn blue lg" disabled={busy}>{busy ? "Checking…" : "Log in"}</button>
      <button type="button" className="link" onClick={() => setSentTo(null)}>Use a different email</button>
    </form>
  );
}
