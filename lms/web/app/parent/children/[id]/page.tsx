"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHead } from "@/components/ui";
import { ProgressReport } from "@/components/progress";

// Parent's progress report for one child (RUB-4, CRT-1).
export default function ChildReport() {
  const { id } = useParams<{ id: string }>();
  return (
    <>
      <PageHead title="Progress report" sub={<Link href="/parent">My children</Link>}>
        <button className="btn white no-print" onClick={() => window.print()}>Print</button>
      </PageHead>
      <ProgressReport studentId={id} />
    </>
  );
}
