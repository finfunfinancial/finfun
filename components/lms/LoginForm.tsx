"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Notice } from "@/components/lms/ui";
import { homeFor, lmsReady, useMe } from "@/lib/lms/auth";
import { supabase } from "@/lib/lms/supabase";
import { useAction } from "@/lib/lms/use-data";

/** Sign up or log in with a mobile number or email and a 6-digit code — a new number or email creates the account.
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
            <p className="muted">New here? Just enter your number — we’ll create your account.</p>
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
  const [id, setId] = useState("");
  const [sentTo, setSentTo] = useState<{ phone?: string; email?: string } | null>(null);
  const [code, setCode] = useState("");
  const { busy, error, run } = useAction();

  const target = () => {
    const v = id.trim();
    if (v.includes("@")) return { email: v.toLowerCase() };
    const digits = v.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    if (digits.length !== 10) throw new Error("Enter a 10-digit mobile number or an email address.");
    return { phone: `+91${digits}` };
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const t = target();
      const { error } = await supabase.auth.signInWithOtp(t);
      if (error) throw error;
      setSentTo(t);
    });
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const { error } = sentTo!.email
        ? await supabase.auth.verifyOtp({ email: sentTo!.email, token: code.trim(), type: "email" })
        : await supabase.auth.verifyOtp({ phone: sentTo!.phone!, token: code.trim(), type: "sms" });
      if (error) throw new Error("That code isn’t right, or it has expired.");
    });
  };

  if (!sentTo) {
    return (
      <form className="stack" onSubmit={send}>
        <label>
          Mobile number or email
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="98765 43210" autoComplete="username" required />
        </label>
        <Notice kind="error">{error}</Notice>
        <button className="btn blue lg" disabled={busy}>{busy ? "Sending…" : "Send me a code"}</button>
      </form>
    );
  }
  return (
    <form className="stack" onSubmit={verify}>
      <p>We sent a 6-digit code to <strong>{sentTo.phone ?? sentTo.email}</strong>.</p>
      <label>
        Code
        <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus />
      </label>
      <Notice kind="error">{error}</Notice>
      <button className="btn blue lg" disabled={busy}>{busy ? "Checking…" : "Log in"}</button>
      <button type="button" className="link" onClick={() => setSentTo(null)}>Use a different number or email</button>
    </form>
  );
}
