"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gate, lmsReady, useUser } from "@/lib/lms/auth";
import { supabase } from "@/lib/lms/supabase";

/** Scopes the portal styles (app/portal.css) and covers deployments where accounts aren't switched on yet. */
export function Portal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`portal ${className}`}>
      {lmsReady ? children : (
        <div className="page">
          <Notice>Accounts are being set up. Please check back soon, or WhatsApp us to enrol.</Notice>
        </div>
      )}
    </div>
  );
}

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/programs", label: "Courses" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/audit", label: "Audit log" },
];

/** Admin portal frame: its own top bar instead of the marketing header. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Portal className="app">
      <Gate roles={["admin"]}>
        <TopBar />
        <div className="page">{children}</div>
      </Gate>
    </Portal>
  );
}

/** Buyer pages (My courses, lessons) sit inside the normal site header and footer. */
export function BuyerPage({ children }: { children: React.ReactNode }) {
  return (
    <Portal>
      <Gate roles={["parent"]}>
        <div className="page">{children}</div>
      </Gate>
    </Portal>
  );
}

function TopBar() {
  const me = useUser();
  const path = usePathname();
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };
  return (
    <header className="topbar">
      <Link href="/admin" className="brand">
        <img src="/a/logo.webp" alt="FinFun" width={118} height={30} />
      </Link>
      <nav>
        {adminNav.map((n) => (
          <Link key={n.href} href={n.href} aria-current={(n.href === "/admin" ? path === n.href : path.startsWith(n.href)) ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="who">
        <Link href="/">View site</Link>
        <span>{me.full_name || me.email}</span>
        <button className="link" onClick={signOut}>Log out</button>
      </div>
    </header>
  );
}

export function LogOut() {
  const router = useRouter();
  return (
    <button className="link" onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}>
      Log out
    </button>
  );
}

export function Notice({ kind = "info", children }: { kind?: "info" | "error" | "ok"; children: React.ReactNode }) {
  if (!children) return null;
  return <p className={`notice ${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</p>;
}

/** Shows an error, a loading line, or the content once data is in. */
export function Loaded<T>({ data, error, children }: { data: T | undefined; error: string | null; children: (d: T) => React.ReactNode }) {
  if (error) return <Notice kind="error">{error}</Notice>;
  if (data === undefined) return <p className="loading">Loading…</p>;
  return <>{children(data)}</>;
}

export function PageHead({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, warn }: { label: string; value: React.ReactNode; warn?: boolean }) {
  return (
    <div className={warn ? "stat warn" : "stat"}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export const Empty = ({ children }: { children: React.ReactNode }) => <p className="empty">{children}</p>;

export const statusChip = (s: string) => <span className={`chip s-${s}`}>{s.replace("_", " ")}</span>;
