import type { Metadata } from "next";
import Link from "next/link";
import Utility from "@/components/Utility";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: "Login", description: "Log in to your FinFun courses.", robots: { index: false } };

export default function Login() {
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
      <p>Parents and students log in to reach purchased courses. Student logins are created by a parent or school — students can’t sign up on their own.</p>
    </Utility>
  );
}
