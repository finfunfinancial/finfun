"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Notice } from "@/components/ui";
import { homeFor, useMe } from "@/lib/auth";
import { fn, supabase } from "@/lib/supabase";
import { useAction } from "@/lib/use-data";

type Mode = "adult" | "student";

export default function Login() {
  const me = useMe();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("adult");

  const home = me ? homeFor(me.role) : "/";
  useEffect(() => {
    if (home !== "/") router.replace(home);
  }, [home, router]);

  if (me && home === "/") {
    return (
      <div className="login">
        <div className="login-box card">
          <h1>Nothing here yet</h1>
          <p>Your account doesn't have a FinFun area yet. Please contact the FinFun team.</p>
          <button className="btn" onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login">
      <div className="login-box">
        <div className="login-head">
          <img src="/a/sticker/10-hi-im-rupi.webp" alt="" width={110} height={110} />
          <h1>Log in to FinFun</h1>
        </div>
        <div className="card">
          <div className="tabs" role="group" aria-label="Who is logging in?">
            <button aria-pressed={mode === "adult"} onClick={() => setMode("adult")}>Parent or staff</button>
            <button aria-pressed={mode === "student"} onClick={() => setMode("student")}>Student</button>
          </div>
          {mode === "adult" ? <CodeLogin /> : <StudentLogin />}
        </div>
        {me === null && <p className="fine" style={{ textAlign: "center", marginTop: 16 }}>Students get their username and PIN from a parent or their school.</p>}
      </div>
    </div>
  );
}

/** Parents and staff: phone or email, then a 6-digit code. New phone/email = new parent account. */
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
      if (error) throw new Error("That code isn't right, or it has expired.");
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

function StudentLogin() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const { busy, error, run } = useAction();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const { session } = await fn("student-login", { username, pin });
      const { error } = await supabase.auth.setSession(session);
      if (error) throw error;
    });
  };

  return (
    <form className="stack" onSubmit={submit}>
      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" autoComplete="username" required />
      </label>
      <label>
        PIN
        <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" inputMode="numeric" maxLength={6} autoComplete="current-password" required />
      </label>
      <Notice kind="error">{error}</Notice>
      <button className="btn lg" disabled={busy}>{busy ? "Checking…" : "Let's go!"}</button>
    </form>
  );
}
