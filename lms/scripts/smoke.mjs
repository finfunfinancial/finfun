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

async function call(path, { token, body, method = body ? "POST" : "GET", prefer } = {}) {
  const res = await fetch(URL + path, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token ?? KEY}`,
      "Content-Type": "application/json",
      ...(prefer && { Prefer: prefer }),
    },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}
const fn = (name, body, token) => call(`/functions/v1/${name}`, { body, token });

async function parentLogin(phone) {
  await call("/auth/v1/otp", { body: { phone } });
  const { data } = await call("/auth/v1/verify", { body: { type: "sms", phone, token: "123456" } });
  assert.ok(data.access_token, `parent ${phone} could not log in`);
  return data.access_token;
}

const step = (name) => console.log(`✔ ${name}`);

const programs = await call("/rest/v1/programs?select=slug,price_paise&order=price_paise");
assert.deepEqual(programs.data.map((p) => p.slug), ["basic", "pro", "advantage"]);
step("catalog is public: 3 programs");

const parent = await parentLogin("919999900001");
step("parent logs in with phone OTP");

let r = await fn("children", { firstName: "Aarav", grade: 6, nickname: "Rav" }, parent);
assert.equal(r.status, 422, "consent is required");
r = await fn("children", { firstName: "Aarav", grade: 6, nickname: "Rav", consent: true }, parent);
assert.equal(r.status, 201, JSON.stringify(r.data));
const { student, username, pin } = r.data;
assert.match(username, /^aarav\d{4}$/);
step(`parent adds a child → login ${username} / PIN ${pin}`);

r = await fn("enrolments", { studentId: student.id, program: "advantage" }, parent);
assert.equal(r.status, 422, "grade 6 can't join Advantage");
r = await fn("enrolments", { studentId: student.id, program: "pro", coupon: "festive", dryRun: true }, parent);
assert.deepEqual(r.data, { pricePaise: 149900, discountPaise: 14990, amountPaise: 134910 });
step("coupon FESTIVE: ₹1,499 → ₹1,349.10");

r = await fn("enrolments", { studentId: student.id, program: "pro", coupon: "FESTIVE" }, parent);
assert.equal(r.status, 503, "Razorpay is empty, so paid checkout must say it isn't switched on");
step(`paid checkout waits for Razorpay keys: "${r.data.error}"`);

r = await fn("enrolments", { studentId: student.id, program: "pro", coupon: "TESTFREE" }, parent);
assert.equal(r.status, 201, JSON.stringify(r.data));
assert.equal(r.data.status, "active");
const enrolmentId = r.data.enrolmentId;
step("₹0 order (TESTFREE) activates the same enrolment");

r = await fn("enrolments", { studentId: student.id, program: "pro" }, parent);
assert.equal(r.status, 409);
step("enrolling twice is refused");

const batches = await call("/rest/v1/batches?select=id,name&status=eq.open", { token: parent });
r = await call("/rest/v1/rpc/assign_batch", { token: parent, body: { p_enrolment: enrolmentId, p_batch: batches.data[0].id } });
assert.equal(r.data, "active", JSON.stringify(r.data));
step(`parent picks batch "${batches.data[0].name}"`);

r = await fn("student-login", { username, pin: pin === "0000" ? "1111" : "0000" });
assert.equal(r.status, 401);
r = await fn("student-login", { username, pin });
assert.equal(r.status, 200, JSON.stringify(r.data));
const studentToken = r.data.session.access_token;
step("student logs in with username + PIN (wrong PIN refused)");

const sessions = await call("/rest/v1/sessions?select=id,number,starts_at&order=number", { token: studentToken });
assert.equal(sessions.data.length, 12);
r = await call("/rest/v1/sessions?select=zoom_passcode", { token: studentToken });
assert.notEqual(r.status, 200, "students must never read Zoom passcodes");
step("student sees 12 sessions but not the Zoom passcode");

r = await fn("join-session", { sessionId: sessions.data[0].id }, studentToken);
assert.ok([403, 410, 503].includes(r.status), JSON.stringify(r));
step(`join-session answers: ${r.status} "${r.data.error}"`);

r = await fn("children", { firstName: "Hacker", grade: 6, consent: true }, studentToken);
assert.equal(r.status, 403);
step("a student can't use parent functions");

const otherParent = await parentLogin("919999900002");
r = await call("/rest/v1/students?select=id", { token: otherParent });
assert.deepEqual(r.data, []);
r = await call("/rest/v1/rpc/assign_batch", { token: otherParent, body: { p_enrolment: enrolmentId, p_batch: batches.data[0].id } });
assert.notEqual(r.status, 200);
r = await fn("enrolments", { studentId: student.id, program: "pro", dryRun: true }, otherParent);
assert.equal(r.status, 404);
step("another parent can't see or touch this child");

r = await call("/rest/v1/students?select=id");
assert.deepEqual(r.data, []);
r = await call("/rest/v1/rpc/mark_order_paid", { body: { p_order: enrolmentId, p_payment_id: "x" } });
assert.notEqual(r.status, 200);
step("logged-out visitors see no children and can't mark orders paid");

console.log("\nAll smoke checks passed.");
