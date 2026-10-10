"use client";
import { usePathname } from "next/navigation";

/** Marketing header, footer and WhatsApp button — hidden in the admin portal and on printable certificates. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return /^\/(admin|certificate)(\/|$)/.test(path) ? null : <>{children}</>;
}
