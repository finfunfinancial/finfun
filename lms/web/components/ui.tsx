"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gate, useUser } from "@/lib/auth";
import { roleLabel } from "@/lib/format";
import { supabase } from "@/lib/supabase";

type NavItem = { href: string; label: string };

/** Page frame for every signed-in area: role gate, top bar with nav, sign-out. */
export function Shell({ roles, nav, kids, children }: { roles: string[]; nav: NavItem[]; kids?: boolean; children: React.ReactNode }) {
  return (
    <Gate roles={roles}>
      <div className={kids ? "app kids" : "app"}>
        <TopBar nav={nav} />
        <main className="page">{children}</main>
      </div>
    </Gate>
  );
}

function TopBar({ nav }: { nav: NavItem[] }) {
  const me = useUser();
  const path = usePathname();
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };
  return (
    <header className="topbar">
      <Link href={nav[0].href} className="brand">
        <img src="/a/logo.webp" alt="FinFun" width={118} height={30} />
      </Link>
      <nav>
        {nav.map((n) => (
          <Link key={n.href} href={n.href} aria-current={(n.href === nav[0].href ? path === n.href : path.startsWith(n.href)) ? "page" : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="who">
        {/* Students' hidden login email is never shown — just their username. */}
        <span>{me.role === "student" ? me.email?.split("@")[0] : me.full_name || me.email || (me.phone && `+${me.phone}`) || roleLabel[me.role]}</span>
        <button className="link" onClick={signOut}>Log out</button>
      </div>
    </header>
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
