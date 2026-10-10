import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/lms/LoginForm";
import Utility from "@/components/Utility";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Login", description: "Log in or sign up to see your FinFun courses.", robots: { index: false } };

export default function Login() {
  return (
    <Suspense>
      <LoginForm fallback={<OldLogin />} />
    </Suspense>
  );
}

// Shown until accounts are switched on for this deployment (NEXT_PUBLIC_SUPABASE_URL / _KEY).
function OldLogin() {
  return (
    <Utility img="/a/sticker/10-hi-im-rupi.webp" title="Log in to FinFun"
      actions={
        <>
          {site.loginUrl ? (
            <a className="btn btn-blue btn-lg" href={site.loginUrl}>Go to my courses</a>
          ) : (
            <Link className="btn btn-blue btn-lg" href="/coming-soon">Go to my courses</Link>
          )}
          <Link className="btn btn-white btn-lg" href="/enrol">Enroll instead</Link>
        </>
      }>
      <p>Parents log in to reach purchased courses.</p>
    </Utility>
  );
}
