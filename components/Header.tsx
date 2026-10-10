"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { nav, navMenus, site, type NavMenu } from "@/lib/content";
import Img from "./Img";
import Logo from "./Logo";

// Logged in? Supabase keeps the session in localStorage as "sb-<project>-auth-token"; reading the key avoids
// loading the Supabase library on every marketing page.
const subscribe = (onChange: () => void) => (window.addEventListener("storage", onChange), () => window.removeEventListener("storage", onChange));
const hasSession = () => Object.keys(localStorage).some((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));

const onPage = (path: string, href: string) => {
  const base = href.split("#")[0];
  return path === base || path.startsWith(`${base}/`);
};
const menuId = (m: NavMenu) => `nav-${m.label.toLowerCase()}`;
// A page can sit in two menus (e.g. /teachers); highlight only the first one.
const menuFor = (path: string) => navMenus.find((m) => [...m.groups.flatMap((g) => g.links), m.more].some((l) => onPage(path, l.href)))?.label;

export default function Header() {
  const loggedIn = useSyncExternalStore(subscribe, hasSession, () => false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  // Menu icons start loading once someone heads for the menu, so pages that never open it don't fetch them.
  const [warm, setWarm] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const path = usePathname();
  const activeMenu = menuFor(path);

  // While a dropdown is open: a click outside the menu, tabbing out of it (the item's onBlur) or Escape closes it;
  // Escape returns focus to its button.
  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: PointerEvent) => !navRef.current?.contains(e.target as Node) && setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      navRef.current?.querySelector<HTMLButtonElement>(`[aria-controls="nav-${menu.toLowerCase()}"]`)?.focus();
      setMenu(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // Down arrow on a menu button opens it and moves to the first link (once the panel is visible).
  const focusFirst = useRef(false);
  useEffect(() => {
    if (!menu || !focusFirst.current) return;
    focusFirst.current = false;
    document.querySelector<HTMLAnchorElement>(`#nav-${menu.toLowerCase()} a`)?.focus();
  }, [menu]);
  const onTriggerKey = (e: React.KeyboardEvent, m: NavMenu) => {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    if (menu === m.label) return document.querySelector<HTMLAnchorElement>(`#${menuId(m)} a`)?.focus();
    focusFirst.current = true;
    setMenu(m.label);
  };

  return (
    <header
      className={`header${open ? " open" : ""}`}
      onClick={(e) => (e.target as HTMLElement).closest("a") && (setOpen(false), setMenu(null))}
    >
      <div className="wrap header-inner">
        <Logo />
        <button className="menu-btn" aria-expanded={open} aria-controls="main-nav" onClick={() => (setOpen(!open), setWarm(true))}>
          <span />
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
        <nav
          id="main-nav"
          className="nav"
          aria-label="Main"
          ref={navRef}
          onPointerEnter={() => setWarm(true)}
          onFocus={() => setWarm(true)}
        >
          {navMenus.map((m) => {
            const isOpen = menu === m.label;
            return (
              <div
                className="nav-item"
                key={m.label}
                onBlur={(e) => e.relatedTarget && !e.currentTarget.contains(e.relatedTarget) && setMenu((cur) => (cur === m.label ? null : cur))}
              >
                <button
                  type="button"
                  className="nav-trigger"
                  aria-expanded={isOpen}
                  aria-controls={menuId(m)}
                  data-active={m.label === activeMenu || undefined}
                  onClick={() => setMenu(isOpen ? null : m.label)}
                  onKeyDown={(e) => onTriggerKey(e, m)}
                >
                  {m.label}
                  <svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1.5 1.5 6 6l4.5-4.5" /></svg>
                </button>
                <div id={menuId(m)} className={`nav-panel${m.groups.length > 1 ? " wide" : ""}`} data-open={isOpen || undefined}>
                  <div className="nav-groups">
                    {m.groups.map((g, i) => (
                      <div className="nav-group" key={g.title ?? i}>
                        {g.title && <p className="nav-group-title">{g.title}</p>}
                        <ul aria-label={g.title}>
                          {g.links.map((l) => (
                            <li key={l.label}>
                              <Link className="nav-link" href={l.href} aria-current={l.href === path ? "page" : undefined}>
                                {l.icon && <span className="nav-icon">{warm && <Img src={l.icon} alt="" sizes="60px" loading="eager" />}</span>}
                                <span className="nav-link-label">
                                  {l.label}
                                  {l.tag && <span className="nav-tag">{l.tag}</span>}
                                </span>
                                {l.text && <span className="nav-link-text">{l.text}</span>}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <Link className="nav-more" href={m.more.href}>
                    {m.more.label} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
          {nav.map((n) => (
            <Link key={n.href} className="nav-top" href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>
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
