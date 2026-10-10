// FinFun admin tools that need the service role (ADM-1, ADM-3, SCH-2). Admins only.
//   POST /admin { action: "create_staff", email, fullName, role, orgId? }  → { userId }
//   POST /admin { action: "set_role", userId, role }                       → { ok }
//   POST /admin { action: "reset_pin", studentId }                         → { username, pin }
//   POST /admin { action: "mark_paid", orderId, reference }                → { enrolmentId }   (offline / UPI payments)
//   POST /admin { action: "import_students", sectionId, rows: [{ firstName, grade }] } → { students: [{ name, username, pin }] }
import { admin, caller, must, UUID } from "../_shared/db.ts";
import { HttpError, json, readJson, serve } from "../_shared/http.ts";
import { checkChild, createStudentLogin, resetStudentPin } from "../_shared/students.ts";

const STAFF_ROLES = ["trainer", "teacher", "school_admin", "partner_viewer", "admin"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  action: string;
  email: string;
  fullName: string;
  role: string;
  orgId: string;
  userId: string;
  studentId: string;
  orderId: string;
  reference: string;
  sectionId: string;
  rows: { firstName: string; grade: number }[];
};

const id = (v: unknown, what: string) => {
  if (typeof v !== "string" || !UUID.test(v)) throw new HttpError(422, `Missing ${what}.`);
  return v;
};

serve(async (req) => {
  await caller(req, "admin");
  const b = await readJson<Body>(req);

  switch (b.action) {
    case "create_staff": {
      const email = String(b.email ?? "").trim().toLowerCase();
      if (!EMAIL.test(email)) throw new HttpError(422, "Enter a valid email.");
      if (!STAFF_ROLES.includes(String(b.role))) throw new HttpError(422, "Pick a staff role.");
      const orgId = b.orgId ? id(b.orgId, "school") : null;
      // An existing account (e.g. someone who logged in once as a parent) is promoted instead of duplicated.
      const existing = must(await admin.from("profiles").select("id").eq("email", email).maybeSingle());
      const userId = existing?.id ??
        must(await admin.auth.admin.createUser({ email, email_confirm: true, app_metadata: { role: b.role } })).user.id;
      if (existing) must(await admin.auth.admin.updateUserById(userId, { app_metadata: { role: b.role } }));
      must(await admin.from("profiles").update({ full_name: String(b.fullName ?? "").trim() || null, org_id: orgId }).eq("id", userId));
      return json({ userId }, 201);
    }

    case "set_role": {
      const userId = id(b.userId, "user");
      if (!["parent", ...STAFF_ROLES].includes(String(b.role))) throw new HttpError(422, "Unknown role.");
      must(await admin.auth.admin.updateUserById(userId, { app_metadata: { role: b.role } }));
      return json({ ok: true });
    }

    case "reset_pin":
      return json(await resetStudentPin(id(b.studentId, "student")));

    case "mark_paid": {
      const orderId = id(b.orderId, "order");
      const reference = String(b.reference ?? "").trim();
      if (!reference) throw new HttpError(422, "Add the payment reference (UPI / bank transaction id).");
      const enrolmentId = must(await admin.rpc("mark_order_paid", { p_order: orderId, p_payment_id: `manual:${reference}` }));
      return json({ enrolmentId });
    }

    case "import_students": {
      const section = must(await admin.from("sections").select("id, org_id").eq("id", id(b.sectionId, "section")).maybeSingle());
      if (!section) throw new HttpError(404, "Section not found.");
      if (!Array.isArray(b.rows) || !b.rows.length || b.rows.length > 200) throw new HttpError(422, "Send 1 to 200 students at a time.");
      const rows = b.rows.map((r) => checkChild(r.firstName, r.grade)); // validate all before creating any
      const created = [];
      for (const { name, grade } of rows) {
        const { userId, username, pin } = await createStudentLogin(name);
        const { error } = await admin.from("students").insert({
          auth_user_id: userId,
          org_id: section.org_id,
          section_id: section.id,
          first_name: name,
          grade,
          username,
        });
        if (error) {
          await admin.auth.admin.deleteUser(userId);
          throw error;
        }
        created.push({ name, username, pin });
      }
      return json({ students: created }, 201);
    }
  }
  throw new HttpError(400, "Unknown action.");
});
