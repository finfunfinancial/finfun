// Parent enrols a child in a program and gets a Razorpay order to pay (PAY-1, PAY-2, PAY-3).
//   POST /enrolments { studentId, program: "basic" | "pro" | "advantage", coupon?, dryRun? }
//   dryRun: true → { pricePaise, discountPaise, amountPaise } (coupon check for the enrol form)
//   otherwise    → 201 { enrolmentId, status: "active" }                                     when the total is ₹0
//                  201 { enrolmentId, orderId, razorpayOrderId, razorpayKeyId, amountPaise }  → open Razorpay Checkout
// After payment the razorpay-webhook function activates the enrolment; the parent then picks a batch
// with supabase.rpc("assign_batch", { p_enrolment, p_batch }).
import { admin, caller, must, UUID } from "../_shared/db.ts";
import { HttpError, json, readJson, serve } from "../_shared/http.ts";
import { discountFor } from "../_shared/pricing.ts";
import * as razorpay from "../_shared/razorpay.ts";

type Body = { studentId: string; program: string; coupon: string; dryRun: boolean };
const PENDING_HOURS = 72;

serve(async (req) => {
  const parent = await caller(req, "parent");
  const { studentId, program: slug, coupon: code, dryRun } = await readJson<Body>(req);
  if (!studentId || !UUID.test(studentId)) throw new HttpError(422, "Please choose which child to enrol.");

  const link = must(
    await admin.from("guardian_links").select("student_id").eq("parent_id", parent.id).eq("student_id", studentId).maybeSingle(),
  );
  if (!link) throw new HttpError(404, "Child not found.");

  const [student, program] = await Promise.all([
    admin.from("students").select("grade").eq("id", studentId).single().then(must),
    admin.from("programs").select("id, name, price_paise, grade_min, grade_max").eq("slug", String(slug ?? "")).eq("active", true)
      .maybeSingle().then(must),
  ]);
  if (!program) throw new HttpError(404, "Program not found.");
  if (student.grade < program.grade_min || student.grade > program.grade_max) {
    throw new HttpError(422, `${program.name} is for grades ${program.grade_min} to ${program.grade_max}.`);
  }

  let coupon = null;
  if (code?.trim()) {
    const c = must(await admin.from("coupons").select("*").eq("code", code.trim().toUpperCase()).eq("active", true).maybeSingle());
    const valid = c && (!c.expires_at || new Date(c.expires_at) > new Date()) && (!c.program_ids || c.program_ids.includes(program.id));
    if (!valid) throw new HttpError(422, "That coupon isn't valid for this program.");
    const paid = () => admin.from("orders").select("id", { count: "exact", head: true }).eq("coupon_id", c.id).eq("status", "paid");
    const [{ count: used }, { count: mine }] = await Promise.all([paid(), paid().eq("parent_id", parent.id)]);
    if ((c.max_uses && (used ?? 0) >= c.max_uses) || (mine ?? 0) >= c.per_parent_limit) {
      throw new HttpError(422, "That coupon has already been used.");
    }
    coupon = c;
  }
  const discount = discountFor(program.price_paise, coupon);
  const amount = program.price_paise - discount;
  if (dryRun) return json({ pricePaise: program.price_paise, discountPaise: discount, amountPaise: amount });

  // Reuse the open enrolment, so a retry or double click doesn't create a second one.
  const open = must(
    await admin.from("enrolments").select("id, status").eq("student_id", studentId).eq("program_id", program.id)
      .in("status", ["pending", "active", "waitlisted"]).maybeSingle(),
  );
  if (open && open.status !== "pending") throw new HttpError(409, "Your child is already enrolled in this program.");
  const expiresAt = new Date(Date.now() + PENDING_HOURS * 3600e3).toISOString();
  const enrolment = open ??
    must(await admin.from("enrolments").insert({ student_id: studentId, program_id: program.id, expires_at: expiresAt }).select("id").single());

  const order = must(
    await admin.from("orders").insert({
      parent_id: parent.id,
      enrolment_id: enrolment.id,
      amount_paise: amount,
      discount_paise: discount,
      coupon_id: coupon?.id ?? null,
    }).select("id").single(),
  );

  if (amount === 0) {
    must(await admin.rpc("mark_order_paid", { p_order: order.id, p_payment_id: null }));
    return json({ enrolmentId: enrolment.id, status: "active" }, 201);
  }

  const rp = await razorpay.createOrder(amount, order.id); // 503 until Razorpay keys are set
  must(await admin.from("orders").update({ razorpay_order_id: rp.id }).eq("id", order.id));
  return json({ enrolmentId: enrolment.id, orderId: order.id, razorpayOrderId: rp.id, razorpayKeyId: razorpay.keyId(), amountPaise: amount }, 201);
});
