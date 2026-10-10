"use client";
import { Shell } from "@/components/ui";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <Shell roles={["student"]} nav={[{ href: "/learn", label: "Home" }]} kids>{children}</Shell>;
}
