// Pure-logic checks. Run: node --test supabase/functions/_shared/logic.test.ts   (Node 22.18+ runs .ts directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import { discountFor } from "./pricing.ts";
import { newPin, newUsername, studentPassword } from "./student-auth.ts";

test("coupon discounts stay within the price", () => {
  assert.equal(discountFor(149900, null), 0);
  assert.equal(discountFor(149900, { kind: "percent", value: 10 }), 14990);
  assert.equal(discountFor(149900, { kind: "percent", value: 15 }), 22485);
  assert.equal(discountFor(99900, { kind: "percent", value: 100 }), 99900);
  assert.equal(discountFor(99900, { kind: "percent", value: 150 }), 99900);
  assert.equal(discountFor(99900, { kind: "flat", value: 20000 }), 20000);
  assert.equal(discountFor(99900, { kind: "flat", value: 500000 }), 99900);
});

test("student passwords depend on username, PIN and pepper", async () => {
  const a = await studentPassword("aarav4821", "0427", "pepper-1");
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, await studentPassword("aarav4821", "0427", "pepper-1"));
  assert.notEqual(a, await studentPassword("aarav4821", "0428", "pepper-1"));
  assert.notEqual(a, await studentPassword("aarav4822", "0427", "pepper-1"));
  assert.notEqual(a, await studentPassword("aarav4821", "0427", "pepper-2"));
  await assert.rejects(studentPassword("aarav4821", "0427", ""));
});

test("usernames and PINs match the database rules", () => {
  for (const name of ["Aarav", "Zoë", "अनन्या", "A", "Mary-Jane O'Neil"]) {
    assert.match(newUsername(name), /^[a-z0-9]{3,30}$/);
  }
  assert.match(newUsername("Zoë"), /^zoe\d{4}$/);
  assert.match(newUsername("अनन्या"), /^student\d{4}$/);
  for (let i = 0; i < 200; i++) assert.match(newPin(), /^\d{4}$/);
});
