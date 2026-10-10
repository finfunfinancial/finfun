// Student sign-in with username + PIN (ACC-3, ACC-6). No JWT needed to call it (see config.toml).
//   POST /student-login { username, pin } → { session }   (5 wrong PINs lock the login for 15 minutes)
// The app then calls supabase.auth.setSession(session) and is signed in as the student.
import { admin, anonClient } from "../_shared/db.ts";
import { HttpError, json, readJson, serve } from "../_shared/http.ts";
import { studentEmail, studentPassword } from "../_shared/student-auth.ts";

const PEPPER = Deno.env.get("STUDENT_PIN_PEPPER") ?? "";
const WRONG = "That username or PIN isn't right.";

serve(async (req) => {
  const { username, pin } = await readJson<{ username: string; pin: string }>(req);
  const user = String(username ?? "").trim().toLowerCase();
  const code = String(pin ?? "").trim();
  if (!user || !/^\d{4,6}$/.test(code)) throw new HttpError(401, WRONG);

  const { data: s } = await admin.from("students").select("id, failed_logins, locked_until").eq("username", user).maybeSingle();
  if (!s) throw new HttpError(401, WRONG);
  if (s.locked_until && new Date(s.locked_until) > new Date()) {
    throw new HttpError(429, "Too many tries. Wait 15 minutes, or ask a parent to reset your PIN.");
  }

  const { data, error } = await anonClient().auth.signInWithPassword({
    email: studentEmail(user),
    password: await studentPassword(user, code, PEPPER),
  });
  if (error || !data.session) {
    await admin.rpc("student_login_failed", { p_student: s.id });
    throw new HttpError(401, WRONG);
  }
  if (s.failed_logins) await admin.from("students").update({ failed_logins: 0 }).eq("id", s.id);
  return json({ session: data.session });
});
