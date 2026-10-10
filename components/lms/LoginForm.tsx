"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Notice } from "@/components/lms/ui";
import { homeFor, lmsReady, useMe } from "@/lib/lms/auth";
import { supabase } from "@/lib/lms/supabase";
import { useAction } from "@/lib/lms/use-data";

type Mode = "login" | "signup" | "forgot";
const MIN_PASSWORD = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email + password accounts (Supabase Auth). Log in, sign up, or reset a forgotten password.
 *  Afterwards admins go to /admin and everyone else to `next` (e.g. back to checkout) or My courses. */
export default function LoginForm({ fallback }: { fallback: React.ReactNode }) {
  const me = useMe();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const resetting = params.get("reset") === "1"; // arrived from a "reset your password" email
  // Admins may only be sent on to admin pages; everyone else to `next` (e.g. back to checkout) or their home.
  const home = me ? (me.role === "admin" ? (next?.startsWith("/admin") ? next : "/admin") : next?.startsWith("/") ? next : homeFor(me.role)) : null;
  const [mode, setMode] = useState<Mode>("login");

  useEffect(() => {
    if (home && home !== "/" && !resetting) router.replace(home);
  }, [home, resetting, router]);

  // Links in Supabase emails (confirm sign-up, reset password) land here; an expired or used one comes back as #error=….
  const hash = useSyncExternalStore(
    (onChange) => (window.addEventListener("hashchange", onChange), () => window.removeEventListener("hashchange", onChange)),
    () => window.location.hash,
    () => "",
  );
  const linkError = new URLSearchParams(hash.slice(1)).get("error_code");

  if (!lmsReady) return <>{fallback}</>;

  const title = resetting && me ? "Choose a new password" : mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Log in";
  return (
    <div className="portal">
      <div className="login">
        <div className="login-box">
          <div className="login-head">
            <img src="/a/sticker/10-hi-im-rupi.webp" alt="" width={110} height={110} />
            <h1>{title}</h1>
            {!me && mode !== "forgot" && !resetting && (
              <p className="muted">One account for everything: book a free trial, pay for a course, and follow your child’s classes and progress.</p>
            )}
          </div>
          <div className="card">
            {linkError && !me && <Notice kind="error">That email link has expired or was already used. Please try again.</Notice>}
            {resetting && me ? (
              <NewPassword onDone={() => router.replace(home && home !== "/" ? home : "/")} />
            ) : me && home === "/" ? (
              <Notice>This account doesn’t have access here. Please contact FinFun.</Notice>
            ) : (
              <>
                {mode !== "forgot" && (
                  <div className="tabs" role="group" aria-label="Log in or sign up">
                    <button aria-pressed={mode === "login"} onClick={() => setMode("login")}>Log in</button>
                    <button aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>Sign up</button>
                  </div>
                )}
                <PasswordForm mode={mode} setMode={setMode} next={next} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordForm({ mode, setMode, next }: { mode: Mode; setMode: (m: Mode) => void; next: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const { busy, error, run } = useAction();
  const back = (extra = "") => `${window.location.origin}/login?${new URLSearchParams({ ...(next && { next }), ...(extra && { [extra]: "1" }) })}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(null);
    run(async () => {
      const address = email.trim().toLowerCase();
      if (!EMAIL.test(address)) throw new Error("Please enter a valid email address.");

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: back("reset") });
        if (error) throw new Error(error.status === 429 ? "Too many emails sent. Please wait a few minutes and try again." : error.message);
        return setDone(`If ${address} has an account, we’ve emailed a link to reset the password.`);
      }

      if (password.length < MIN_PASSWORD) throw new Error(`Passwords need at least ${MIN_PASSWORD} characters.`);
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: address, password, options: { emailRedirectTo: back() } });
        if (error) throw new Error(error.message);
        // With "Confirm email" on in Supabase there's no session yet: the person confirms from their inbox first.
        if (!data.session) setDone(`We’ve emailed ${address} a link to confirm your account. Click it, then log in here.`);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: address, password });
      if (error) {
        throw new Error(/confirm/i.test(error.message) ? "Please confirm your email first — check your inbox for our link." : "That email or password isn’t right.");
      }
    });
  };

  return (
    <form className="stack" onSubmit={submit}>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
      </label>
      {mode !== "forgot" && (
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={MIN_PASSWORD} required
            autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        </label>
      )}
      {mode === "signup" && <p className="fine" style={{ margin: 0 }}>At least {MIN_PASSWORD} characters.</p>}
      <Notice kind="error">{error}</Notice>
      <Notice kind="ok">{done}</Notice>
      <button className="btn blue lg" disabled={busy}>
        {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Email me a reset link" : "Log in"}
      </button>
      {mode === "login" && <button type="button" className="link" onClick={() => setMode("forgot")}>Forgot password?</button>}
      {mode === "forgot" && <button type="button" className="link" onClick={() => setMode("login")}>Back to log in</button>}
    </form>
  );
}

function NewPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const { busy, error, run } = useAction();
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (password.length < MIN_PASSWORD) throw new Error(`Passwords need at least ${MIN_PASSWORD} characters.`);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      onDone();
    });
  };
  return (
    <form className="stack" onSubmit={save}>
      <label>
        New password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={MIN_PASSWORD} autoComplete="new-password" required autoFocus />
      </label>
      <Notice kind="error">{error}</Notice>
      <button className="btn blue lg" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
    </form>
  );
}
