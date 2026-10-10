// Students have no email or phone (DPDP minimisation), so each one is a hidden Supabase Auth user:
//   email    = <username>@students.finfun.club   (never emailed)
//   password = HMAC-SHA256(STUDENT_PIN_PEPPER, "<username>:<pin>")
// Because the password needs the server-side pepper, a PIN can only be tried through the student-login
// function and its lockout, never against Supabase Auth directly.
// ponytail: rotating STUDENT_PIN_PEPPER breaks every student login; to rotate, reset all PINs in one job.

export const studentEmail = (username: string) => `${username}@students.finfun.club`;

export async function studentPassword(username: string, pin: string, pepper: string): Promise<string> {
  if (!pepper) throw new Error("STUDENT_PIN_PEPPER is not set");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${username}:${pin}`));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

const random = (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n;

/** A 4-digit PIN, e.g. "0427". */
export const newPin = () => String(random(10000)).padStart(4, "0");

/** First name letters (ASCII only) plus 4 digits, e.g. "aarav4821". */
export function newUsername(firstName: string): string {
  const base = firstName.toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "").slice(0, 12);
  return (base.length >= 2 ? base : "student") + (1000 + random(9000));
}
