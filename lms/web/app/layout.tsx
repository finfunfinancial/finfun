import type { Metadata, Viewport } from "next";
import { Architects_Daughter, Nunito } from "next/font/google";
import "./globals.css";

const hand = Architects_Daughter({ weight: "400", subsets: ["latin"], variable: "--font-hand", display: "swap" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: "FinFun", template: "%s · FinFun" },
  description: "FinFun classes, lessons and progress for parents, students and schools.",
  robots: { index: false },
};

export const viewport: Viewport = { themeColor: "#fffbf0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${hand.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
