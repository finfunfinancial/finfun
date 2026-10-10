// End-to-end smoke test against the LOCAL stack. Needs `supabase start` and a fresh `supabase db reset`.
//   node scripts/smoke.mjs
// Reads the local URL and anon key from `supabase status`. Never point this at production.
import { execSync } from "node:child_process";
import assert from "node:assert/strict";

const env = Object.fromEntries(
  execSync("supabase status -o env", { encoding: "utf8" }).split("\n")
    .map((l) => l.match(/^(\w+)="?(.*?)"?$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
const URL = env.API_URL, KEY = env.ANON_KEY;
assert.ok(URL?.includes("127.0.0.1"), "smoke test only runs against the local stack");

async function call(path, { token, body, method = body ? "POST" : "GET" } = {}) {
  const res = await fetch(URL + path, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${token ?? KEY}`, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}
const fn = (name, body, token) => call(`/functions/v1/${name}`, { body, token });
const rpc = (name, body, token) => call(`/rest/v1/rpc/${name}`, { body, token });

/** Sign up then log in with email + password, exactly like the website (local email confirmation is off). */
async function buyerLogin(email) {
  const password = "local-test-password";
  const signup = await call("/auth/v1/signup", { body: { email, password } });
  assert.equal(signup.status, 200, `could not sign up ${email}: ${JSON.stringify(signup.data)}`);
  const wrong = await call("/auth/v1/token?grant_type=password", { body: { email, password: "not-the-password" } });
  assert.notEqual(wrong.status, 200, "a wrong password must be refused");
  const { data } = await call("/auth/v1/token?grant_type=password", { body: { email, password } });
  assert.ok(data.access_token, `buyer ${email} could not log in`);
  return data.access_token;
}

const step = (name) => console.log(`✔ ${name}`);

const programs = await call("/rest/v1/programs?select=slug,price_paise&order=price_paise");
assert.deepEqual(programs.data.map((p) => p.slug), ["basic", "pro", "advantage"]);
step("catalog is public: 3 programs");

const buyer = await buyerLogin("buyer1@finfun.test");
step("buyer signs up and logs in with email + password (wrong password refused)");

const phone = await call("/auth/v1/otp", { body: { phone: "919999900001" } });
assert.notEqual(phone.status, 200, "phone login must be switched off");
step("phone login is switched off (email only)");

const aarav = { firstName: "Aarav", grade: 6, consent: true };
let r = await fn("enrolments", { program: "advantage", learner: aarav, dryRun: true }, buyer);
assert.equal(r.status, 422, "grade 6 can't join Advantage");
r = await fn("enrolments", { program: "pro", learner: aarav, coupon: "festive", dryRun: true }, buyer);
assert.deepEqual(r.data, { pricePaise: 149900, discountPaise: 14990, amountPaise: 134910 });
step("coupon FESTIVE: ₹1,499 → ₹1,349.10");

r = await fn("enrolments", { program: "pro", learner: { ...aarav, consent: false } }, buyer);
assert.equal(r.status, 422, "consent is required to save a child");
r = await fn("enrolments", { program: "pro", learner: aarav, coupon: "FESTIVE" }, buyer);
assert.equal(r.status, 503, "Razorpay is empty, so paid checkout must say it isn't switched on");
step(`paid checkout waits for Razorpay keys: "${r.data.error}"`);
r = await fn("enrolments", { program: "pro", learner: { ...aarav, firstName: "aarav" }, coupon: "FESTIVE" }, buyer);
assert.equal(r.status, 503);

const learners = await call("/rest/v1/students?select=id,first_name,username", { token: buyer });
assert.equal(learners.data.length, 1);
assert.equal(learners.data[0].username, null, "learners have no login of their own");
const studentId = learners.data[0].id;
step("the child is saved once as a learner on the buyer's account, even when checkout is retried (no separate login)");

r = await fn("enrolments", { program: "pro", studentId, coupon: "TESTFREE" }, buyer);
assert.equal(r.status, 201, JSON.stringify(r.data));
assert.equal(r.data.status, "active");
const enrolmentId = r.data.enrolmentId;
step("₹0 order (TESTFREE) activates the same enrolment");

r = await fn("enrolments", { program: "pro", studentId }, buyer);
assert.equal(r.status, 409);
step("buying the same course twice is refused");

const batches = await call("/rest/v1/batches?select=id,name&status=eq.open", { token: buyer });
r = await rpc("assign_batch", { p_enrolment: enrolmentId, p_batch: batches.data[0].id }, buyer);
assert.equal(r.data, "active", JSON.stringify(r.data));
step(`buyer picks batch "${batches.data[0].name}"`);

const sessions = await call("/rest/v1/sessions?select=id,number,starts_at&order=number", { token: buyer });
assert.equal(sessions.data.length, 12);
r = await call("/rest/v1/sessions?select=zoom_passcode", { token: buyer });
assert.notEqual(r.status, 200, "buyers must never read Zoom passcodes");
step("buyer sees 12 sessions but not the Zoom passcode");

r = await fn("join-session", { sessionId: sessions.data[0].id, studentId }, buyer);
assert.ok([403, 410, 503].includes(r.status), JSON.stringify(r));
step(`join-session answers: ${r.status} "${r.data.error}"`);

const items = await call("/rest/v1/content_items?select=id,kind,title&order=position", { token: buyer });
const activity = items.data.find((c) => c.kind === "activity");
const quiz = items.data.find((c) => c.kind === "quiz");
r = await rpc("complete_item", { p_item: activity.id, p_student: studentId }, buyer);
assert.equal(r.status, 204, JSON.stringify(r.data));
r = await rpc("submit_quiz", { p_item: quiz.id, p_student: studentId, p_answers: [0, 0] }, buyer);
assert.deepEqual(r.data, { score: 50, passed: false, results: [true, false] });
r = await rpc("submit_quiz", { p_item: quiz.id, p_student: studentId, p_answers: [0, 1] }, buyer);
assert.equal(r.data.passed, true);
r = await call("/rest/v1/quiz_keys?select=answers", { token: buyer });
assert.deepEqual(r.data, []);
step("buyer does an activity and a quiz for their child; the answer key stays hidden");

const other = await buyerLogin("buyer2@finfun.test");
r = await call("/rest/v1/students?select=id", { token: other });
assert.deepEqual(r.data, []);
r = await rpc("assign_batch", { p_enrolment: enrolmentId, p_batch: batches.data[0].id }, other);
assert.notEqual(r.status, 200);
r = await fn("enrolments", { program: "pro", studentId, dryRun: true }, other);
assert.equal(r.status, 404);
r = await rpc("complete_item", { p_item: activity.id, p_student: studentId }, other);
assert.notEqual(r.status, 204);
r = await fn("join-session", { sessionId: sessions.data[0].id, studentId }, other);
assert.equal(r.status, 404);
step("another buyer can't see or touch this child");

r = await call("/rest/v1/students?select=id");
assert.deepEqual(r.data, []);
r = await rpc("mark_order_paid", { p_order: enrolmentId, p_payment_id: "x" });
assert.notEqual(r.status, 200);
step("logged-out visitors see no children and can't mark orders paid");

// Contact form: anyone can send a message; only admins can read them.
r = await call("/rest/v1/contact_requests", { body: { name: "Asha", email: "asha@example.com", topic: "parent", message: "When do batches start?" } });
assert.equal(r.status, 201, JSON.stringify(r.data));
r = await call("/rest/v1/contact_requests", { body: { name: "Bot", email: "not-an-email", message: "hi" } });
assert.notEqual(r.status, 201, "a bad email must be refused");
r = await call("/rest/v1/contact_requests", { body: { name: "X", email: "x@example.com", message: "hi", status: "contacted" } });
assert.notEqual(r.status, 201, "visitors can't send a message already marked contacted");
r = await call("/rest/v1/contact_requests?select=id");
assert.deepEqual(r.data, []);
r = await call("/rest/v1/contact_requests?select=id", { token: buyer });
assert.deepEqual(r.data, []);
step("contact form: anyone can send a message, only admins can read them");

console.log("\nAll smoke checks passed.");
