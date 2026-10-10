"use client";
import { useParams } from "next/navigation";
import { Loaded, Notice } from "@/components/ui";
import { longDay } from "@/lib/format";
import { must, supabase } from "@/lib/supabase";
import { useData } from "@/lib/use-data";

// Public certificate check (CRT-2): shows only the first name, program and date.
export default function Verify() {
  const { code } = useParams<{ code: string }>();
  const { data, error } = useData(() => supabase.rpc("verify_certificate", { p_code: code }).then(must), [code]);
  return (
    <div className="login">
      <div className="login-box card" style={{ textAlign: "center" }}>
        <img src="/a/logo.webp" alt="FinFun" width={160} height={41} style={{ margin: "0 auto 12px", display: "block" }} />
        <h1>Certificate check</h1>
        <Loaded data={data} error={error}>
          {(rows: any[]) => rows.length ? (
            <Notice kind="ok">✓ Genuine. <strong>{rows[0].first_name}</strong> completed <strong>{rows[0].program}</strong> on {longDay(rows[0].issued_at)}.</Notice>
          ) : <Notice kind="error">We couldn't find a FinFun certificate with this code.</Notice>}
        </Loaded>
      </div>
    </div>
  );
}
