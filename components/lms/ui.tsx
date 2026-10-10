"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Gate, lmsReady, useUser } from "@/lib/lms/auth";
import { supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";
import { Icon } from "./icons";

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
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/students", label: "Students", icon: "students" },
  { href: "/admin/enrollments", label: "Enrollments", icon: "enrollments" },
  { href: "/admin/waitlist", label: "Waitlist", icon: "waitlist" },
  { href: "/admin/programs", label: "Courses", icon: "courses" },
  { href: "/admin/batches", label: "Batches", icon: "batches" },
  { href: "/admin/sessions", label: "Live Sessions", icon: "live" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/coupons", label: "Coupons", icon: "coupons" },
  { href: "/admin/contacts", label: "Contact requests", icon: "contacts" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/audit", label: "Audit log", icon: "audit" },
] as const;

/** Admin portal frame: a left sidebar (logo, sections, account) instead of the marketing header. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <Portal className="admin">
      <Gate roles={["admin"]}>
        <div className="admin-frame">
          <Sidebar />
          <div className="admin-main">
            <div className="page">{children}</div>
          </div>
        </div>
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

function Sidebar() {
  const me = useUser();
  const path = usePathname();
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };
  const name = me.full_name || me.email?.split("@")[0] || "Admin";
  // New contact-form messages, shown as a count next to "Contact requests"; refreshed when the page changes.
  const { data: newMessages, reload: recount } = useData(
    () => supabase.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "new").then((r) => r.count ?? 0),
    [path],
  );
  useEffect(() => {
    window.addEventListener("contacts-changed", recount);
    return () => window.removeEventListener("contacts-changed", recount);
  }, [recount]);
  return (
    <aside className="sidebar">
      <Link href="/admin" className="sidebar-logo">
        <img src="/a/logo.webp" alt="FinFun admin" width={118} height={30} />
      </Link>
      <nav aria-label="Admin">
        {adminNav.map((n) => {
          const active = n.href === "/admin" ? path === n.href : path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className="side-link" aria-current={active ? "page" : undefined}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.href === "/admin/contacts" && !!newMessages && <span className="count" aria-label={`${newMessages} new`}>{newMessages}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-foot">
        <div className="me">
          <span className="avatar" aria-hidden="true">{name[0].toUpperCase()}</span>
          <span className="me-text">
            <strong>{name}</strong>
            <span>{me.email}</span>
          </span>
        </div>
        <div className="row" style={{ gap: 4 }}>
          <Link href="/" className="side-link small"><Icon name="site" /><span>View site</span></Link>
          <button className="side-link small" onClick={signOut}><Icon name="logout" /><span>Log out</span></button>
        </div>
      </div>
    </aside>
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
