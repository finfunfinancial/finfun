"use client";
import { Shell } from "@/components/ui";

export default function TeachLayout({ children }: { children: React.ReactNode }) {
  return <Shell roles={["trainer", "teacher", "school_admin", "admin"]} nav={[{ href: "/teach", label: "My classes" }]}>{children}</Shell>;
}
