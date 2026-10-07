import type { Metadata } from "next";
import Link from "next/link";
import Utility from "@/components/Utility";

export const metadata: Metadata = {
  title: "Gift FinFun",
  description: "Gift a FinFun money-skills program to a teen you love.",
  alternates: { canonical: "/gifting" },
};

export default function Gifting() {
  return (
    <Utility img="/a/sticker/10-hi-im-rupi.webp" title="Gift FinFun"
      actions={<><Link className="btn btn-lg" href="/contact">Ask about gifting</Link><Link className="btn btn-white btn-lg" href="/programs">See programs</Link></>}>
      <p>Give a teen the gift of money smarts. FinFun gift programs are coming soon — reach out and we’ll help you set one up today.</p>
    </Utility>
  );
}
