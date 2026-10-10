"use client";
import { Shell } from "@/components/ui";

const nav = [
  { href: "/parent", label: "My children" },
  { href: "/parent/enrol", label: "Enrol" },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <Shell roles={["parent"]} nav={nav}>{children}</Shell>;
}
