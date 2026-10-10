// Razorpay adapter — EMPTY until FinFun has Razorpay keys (see lms/README.md, "What's still needed").
// Every caller already uses these functions; filling in the TODOs switches payments on, nothing else changes.
// Needs: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
import { HttpError } from "./http.ts";

const notReady = () =>
  new HttpError(503, "Online payment isn't switched on yet. Our team will contact you to finish enrolling.");

/** Public key id the browser passes to Razorpay Checkout. */
export const keyId = () => Deno.env.get("RAZORPAY_KEY_ID") ?? null;

/** Creates a Razorpay order. `receipt` is our orders.id, so the webhook can be matched back. */
export async function createOrder(_amountPaise: number, _receipt: string): Promise<{ id: string }> {
  // TODO(Razorpay): POST https://api.razorpay.com/v1/orders
  //   Basic auth RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET, body { amount, currency: "INR", receipt }; return { id }.
  throw notReady();
}

/** True when X-Razorpay-Signature equals HMAC-SHA256(RAZORPAY_WEBHOOK_SECRET, raw request body). */
export async function verifyWebhook(_rawBody: string, _signature: string | null): Promise<boolean> {
  // TODO(Razorpay): compute the HMAC with crypto.subtle and compare in constant time.
  throw notReady();
}

/** Refunds a captured payment (PAY-6). */
export async function refund(_paymentId: string, _amountPaise: number): Promise<void> {
  // TODO(Razorpay): POST https://api.razorpay.com/v1/payments/{id}/refund with { amount }.
  throw notReady();
}
