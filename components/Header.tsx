"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { nav, site } from "@/lib/content";
import Logo from "./Logo";

// Logged in? Supabase keeps the session in localStorage as "sb-<project>-auth-token"; reading the key avoids
// loading the Supabase library on every marketing page.
const subscribe = (onChange: () => void) => (window.addEventListener("storage", onChange), () => window.removeEventListener("storage", onChange));
const hasSession = () => Object.keys(localStorage).some((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));

export default function Header() {
  const loggedIn = useSyncExternalStore(subscribe, hasSession, () => false);
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <header className={`header${open ? " open" : ""}`} onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
      <div className="wrap header-inner">
        <Logo />
        <button className="menu-btn" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
          <span />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
        <nav id="main-nav" className="nav" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-cta">
          <a className="header-wa" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi FinFun! I have a question.")}`} target="_blank" rel="noopener" aria-label="WhatsApp FinFun" data-track="whatsapp_click">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm5.8 15.7c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.7 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.2-.3-.3-.6-.4Z" /></svg>
          </a>
          <Link className="login" href="/login">
            {loggedIn ? "My account" : "Log in / Sign up"}
          </Link>
          <Link className="btn btn-sm" href="/enrol" data-track="enrol_click">
            Enroll
          </Link>
        </div>
      </div>
    </header>
  );
}
