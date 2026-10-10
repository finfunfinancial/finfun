import type { Metadata } from "next";

export const metadata: Metadata = { title: "My courses", robots: { index: false } };

export default function MyCoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
