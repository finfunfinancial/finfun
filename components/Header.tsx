"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/lib/content";
import Logo from "./Logo";

export default function Header() {
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
          <Link className="login" href="/login">
            Login
          </Link>
          <Link className="btn btn-sm" href="/enrol" data-track="enrol_click">
            Enroll
          </Link>
        </div>
      </div>
    </header>
  );
}
