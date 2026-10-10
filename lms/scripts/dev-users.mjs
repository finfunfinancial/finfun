// Creates local staff test accounts (local stack only). Run after `supabase db reset`:
//   node scripts/dev-users.mjs
// Then log in at http://localhost:3300 with the email; the 6-digit code arrives in Mailpit (http://127.0.0.1:54324).
import { execSync } from "node:child_process";

const env = Object.fromEntries(
  execSync("supabase status -o env", { encoding: "utf8" }).split("\n")
    .map((l) => l.match(/^(\w+)="?(.*?)"?$/)).filter(Boolean).map((m) => [m[1], m[2]]),
);
if (!env.API_URL?.includes("127.0.0.1")) throw new Error("dev-users only runs against the local stack");

const users = [
  { email: "admin@finfun.test", role: "admin", name: "Test Admin" },
  { email: "trainer@finfun.test", role: "trainer", name: "Test Trainer" },
];
for (const u of users) {
  const res = await fetch(`${env.API_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: env.SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: u.email, email_confirm: true, app_metadata: { role: u.role } }),
  });
  const body = await res.json();
  if (!res.ok && body.error_code !== "email_exists") throw new Error(JSON.stringify(body));
  if (res.ok) {
    await fetch(`${env.API_URL}/rest/v1/profiles?id=eq.${body.id}`, {
      method: "PATCH",
      headers: { apikey: env.SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: u.name }),
    });
  }
  console.log(`${u.role.padEnd(8)} ${u.email}${res.ok ? "" : " (already there)"}`);
}
