import type { Metadata } from "next";

export const metadata: Metadata = { title: "Certificate check", robots: { index: false } };

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
