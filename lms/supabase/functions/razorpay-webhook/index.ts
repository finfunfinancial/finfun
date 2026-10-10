// Razorpay calls this when a payment completes (PAY-2). No JWT: Razorpay signs the body instead (see config.toml).
// Set the webhook URL in Razorpay Dashboard → Webhooks to <project>/functions/v1/razorpay-webhook, event "order.paid".
import { admin, must } from "../_shared/db.ts";
import { HttpError, json, serve } from "../_shared/http.ts";
import * as razorpay from "../_shared/razorpay.ts";

serve(async (req) => {
  const raw = await req.text();
  if (!(await razorpay.verifyWebhook(raw, req.headers.get("x-razorpay-signature")))) {
    throw new HttpError(401, "Bad signature.");
  }
  const event = JSON.parse(raw);
  if (event.event !== "order.paid") return json({ ignored: event.event });

  const razorpayOrderId = event.payload.order.entity.id;
  const order = must(await admin.from("orders").select("id").eq("razorpay_order_id", razorpayOrderId).maybeSingle());
  if (!order) throw new HttpError(404, "Unknown order."); // Razorpay retries, so a race with createOrder heals itself
  must(await admin.rpc("mark_order_paid", { p_order: order.id, p_payment_id: event.payload.payment.entity.id }));
  // TODO: queue the WhatsApp/email receipt (NOT-1), GST invoice (PAY-4) and CRM webhook copy.
  return json({ ok: true });
});
