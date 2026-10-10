import type { Metadata, Viewport } from "next";
import { Architects_Daughter, Nunito, Patrick_Hand_SC } from "next/font/google";
import Analytics from "@/components/Analytics";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SiteChrome from "@/components/SiteChrome";
import WhatsApp from "@/components/WhatsApp";
import { site } from "@/lib/content";
import "./globals.css";
import "./portal.css";

const hand = Architects_Daughter({ weight: "400", subsets: ["latin"], variable: "--font-hand", display: "swap" });
const caps = Patrick_Hand_SC({ weight: "400", subsets: ["latin"], variable: "--font-caps", display: "swap" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "FinFun — Financial literacy for kids and teens, grades 3 to 10", template: "%s · FinFun" },
  description:
    "FinFun is a gamified financial literacy program for students in grades 3 to 10. Kids and teens learn budgeting, saving, UPI and scam safety, SIPs and investing through games, quizzes and challenges.",
  keywords: ["financial literacy for teens", "money skills for students India", "financial literacy program for schools"],
  openGraph: { type: "website", siteName: "FinFun", locale: "en_IN", images: ["/a/about-and-programs/banner-mission-1600x600.webp"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#fffbf0" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${hand.variable} ${caps.variable} ${body.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteChrome>
          <Header />
        </SiteChrome>
        <main id="main">{children}</main>
        <SiteChrome>
          <Footer />
          <WhatsApp />
        </SiteChrome>
        <Analytics />
      </body>
    </html>
  );
}
