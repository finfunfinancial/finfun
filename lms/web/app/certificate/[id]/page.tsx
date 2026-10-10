"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Gate, homeFor, useUser } from "@/lib/auth";
import { Loaded } from "@/components/ui";
import { longDay } from "@/lib/format";
import { must, supabase } from "@/lib/supabase";
import { useData } from "@/lib/use-data";

// Printable certificate (CRT-1). Parents, the student and admins can open it; "Print" saves it as a PDF.
export default function CertificatePage() {
  return <Gate roles={["parent", "student", "admin"]}><Certificate /></Gate>;
}

function Certificate() {
  const { id } = useParams<{ id: string }>();
  const me = useUser();
  const { data, error } = useData(() =>
    supabase.from("certificates").select("verify_code, issued_at, students(first_name), programs(name)").eq("id", id).single().then(must), [id]);
  return (
    <Loaded data={data} error={error}>
      {(c: any) => {
        const verifyUrl = `${window.location.origin}/verify/${c.verify_code}`;
        return (
          <>
            <div className="row no-print" style={{ justifyContent: "center", marginTop: 20 }}>
              <Link className="btn white" href={homeFor(me.role)}>Back</Link>
              <button className="btn" onClick={() => window.print()}>Print or save as PDF</button>
            </div>
            <div className="certificate">
              <img src="/a/logo.webp" alt="FinFun" width={200} height={51} style={{ margin: "0 auto", display: "block" }} />
              <p className="hand" style={{ fontSize: "1.3rem", margin: "12px 0 0" }}>Certificate of completion</p>
              <h1>{c.programs.name}</h1>
              <p>This certifies that</p>
              <p className="name">{c.students.first_name}</p>
              <p style={{ marginTop: 16 }}>has completed the {c.programs.name} program in financial literacy,<br />building real money skills through games, quizzes and live classes.</p>
              <img src="/a/gamification/medal-1-gold.webp" alt="" width={110} height={110} style={{ margin: "16px auto" }} />
              <p className="spread" style={{ justifyContent: "space-around" }}>
                <span>Issued {longDay(c.issued_at)}</span>
                <span>Verify at {verifyUrl.replace(/^https?:\/\//, "")}</span>
              </p>
            </div>
          </>
        );
      }}
    </Loaded>
  );
}
