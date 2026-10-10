// Creating and resetting student logins — shared by the parent (children) and admin functions.
import { admin, must } from "./db.ts";
import { HttpError } from "./http.ts";
import { newPin, newUsername, studentEmail, studentPassword } from "./student-auth.ts";

const PEPPER = Deno.env.get("STUDENT_PIN_PEPPER") ?? "";

/** Creates the hidden Supabase Auth user for a child. The caller must insert the students row (or delete the user). */
export async function createStudentLogin(firstName: string) {
  const pin = newPin();
  for (let tries = 0; tries < 5; tries++) {
    const username = newUsername(firstName);
    const { data, error } = await admin.auth.admin.createUser({
      email: studentEmail(username),
      password: await studentPassword(username, pin, PEPPER),
      email_confirm: true,
      app_metadata: { role: "student" },
    });
    if (error?.code === "email_exists") continue; // username taken, pick another
    if (error) throw error;
    return { userId: data.user.id, username, pin };
  }
  throw new HttpError(409, "Couldn't pick a username. Please try again.");
}

/** Gives a student a new PIN and clears any lockout. Returns the new PIN. */
export async function resetStudentPin(studentId: string) {
  const s = must(await admin.from("students").select("username, auth_user_id").eq("id", studentId).maybeSingle());
  if (!s?.auth_user_id) throw new HttpError(404, "Student not found.");
  const pin = newPin();
  must(await admin.auth.admin.updateUserById(s.auth_user_id, { password: await studentPassword(s.username, pin, PEPPER) }));
  must(await admin.from("students").update({ failed_logins: 0, locked_until: null }).eq("id", studentId));
  return { username: s.username as string, pin };
}

/** Checks a child's first name and grade the same way for parents and schools. */
export function checkChild(firstName: unknown, grade: unknown) {
  const name = String(firstName ?? "").trim();
  if (!name || name.length > 40) throw new HttpError(422, "Please enter the child's first name.");
  if (!Number.isInteger(grade) || (grade as number) < 3 || (grade as number) > 10) {
    throw new HttpError(422, "FinFun is for grades 3 to 10.");
  }
  return { name, grade: grade as number };
}
