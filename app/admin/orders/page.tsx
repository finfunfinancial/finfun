"use client";
import { useState } from "react";
import { Empty, Loaded, PageHead, statusChip } from "@/components/lms/ui";
import { downloadCsv, inr, when } from "@/lib/lms/format";
import { fn, must, supabase } from "@/lib/lms/supabase";
import { useData } from "@/lib/lms/use-data";

// Orders and payments. "Mark paid" records an offline payment (UPI / bank transfer) while Razorpay is off.
export default function Orders() {
  const [status, setStatus] = useState("created");
  const { data, error, reload } = useData(() =>
    supabase.from("orders")
      .select("id, amount_paise, discount_paise, status, invoice_no, razorpay_payment_id, created_at, paid_at, coupons(code), profiles(phone, email, full_name), enrolments(status, students(first_name, username), programs(name))")
      .eq("status", status).order("created_at", { ascending: false }).limit(300).then(must),
    [status]);

  const markPaid = async (orderId: string) => {
    const reference = prompt("Payment reference (UPI or bank transaction ID):");
    if (!reference?.trim()) return;
    try {
      await fn("admin", { action: "mark_paid", orderId, reference });
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const exportCsv = (rows: any[]) => downloadCsv(`finfun-orders-${status}.csv`, rows.map((o) => ({
    created: o.created_at,
    paid: o.paid_at ?? "",
    invoice: o.invoice_no ?? "",
    parent: o.profiles?.full_name ?? "",
    phone: o.profiles?.phone ?? "",
    email: o.profiles?.email ?? "",
    student: o.enrolments?.students?.first_name,
    program: o.enrolments?.programs?.name,
    amount_inr: o.amount_paise / 100,
    discount_inr: o.discount_paise / 100,
    coupon: o.coupons?.code ?? "",
    payment_ref: o.razorpay_payment_id ?? "",
    status: o.status,
  })));

  return (
    <>
      <PageHead title="Orders" sub="Unpaid orders are parents who started enrolling but haven't paid yet.">
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Order status">
          <option value="created">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
        {data && data.length > 0 && <button className="btn white" onClick={() => exportCsv(data)}>Export CSV</button>}
      </PageHead>
      <Loaded data={data} error={error}>
        {(rows) => rows.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Parent</th><th>Student · program</th><th className="num">Amount</th><th>Coupon</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((o: any) => (
                  <tr key={o.id}>
                    <td>{when(o.created_at)}{o.invoice_no && <><br /><span className="fine">Invoice #{o.invoice_no}</span></>}</td>
                    <td>{o.profiles?.full_name ?? (o.profiles?.phone ? `+${o.profiles.phone}` : o.profiles?.email)}</td>
                    <td>{o.enrolments?.students?.first_name} · {o.enrolments?.programs?.name}</td>
                    <td className="num">{inr(o.amount_paise)}{o.discount_paise > 0 && <><br /><span className="fine">−{inr(o.discount_paise)}</span></>}</td>
                    <td>{o.coupons?.code ?? "—"}</td>
                    <td>{statusChip(o.status)}</td>
                    <td className="num">{o.status === "created" && <button className="btn sm" onClick={() => markPaid(o.id)}>Mark paid</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No {status === "created" ? "unpaid" : status} orders.</Empty>}
      </Loaded>
    </>
  );
}
