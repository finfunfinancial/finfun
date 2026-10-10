// Parents add children and manage their logins (ACC-2, ACC-3).
//   POST /children                 { firstName, grade, nickname?, consent: true } → 201 { student, username, pin }
//   POST /children/<id>/reset-pin                                                 → { username, pin }
// The PIN is returned once and never stored in plain text.
import { admin, caller, must, UUID } from "../_shared/db.ts";
import { HttpError, json, readJson, serve } from "../_shared/http.ts";
import { checkChild, createStudentLogin, resetStudentPin } from "../_shared/students.ts";

const POLICY_VERSION = Deno.env.get("CONSENT_POLICY_VERSION") ?? "2026-10";

type NewChild = { firstName: string; grade: number; nickname: string; consent: boolean };

serve(async (req) => {
  const parent = await caller(req, "parent");
  const [, id, action] = new URL(req.url).pathname.split("/children")[1].split("/");

  if (!id) {
    const body = await readJson<NewChild>(req);
    const { name, grade } = checkChild(body.firstName, body.grade);
    const nick = String(body.nickname ?? "").trim() || null;
    if (nick && nick.length > 30) throw new HttpError(422, "Nickname is too long.");
    if (body.consent !== true) throw new HttpError(422, "We need your consent to create your child's account.");

    const { userId, username, pin } = await createStudentLogin(name);
    const { data: student, error } = await admin.rpc("add_child", {
      p_parent: parent.id,
      p_auth_user: userId,
      p_first_name: name,
      p_nickname: nick,
      p_grade: grade,
      p_username: username,
      p_policy_version: POLICY_VERSION,
      p_ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null,
    });
    if (error) {
      await admin.auth.admin.deleteUser(userId); // don't leave a login with no child behind
      throw error;
    }
    return json({ student: { id: student.id, firstName: student.first_name, nickname: student.nickname, grade: student.grade }, username, pin }, 201);
  }

  if (action === "reset-pin" && UUID.test(id)) {
    const link = must(
      await admin.from("guardian_links").select("student_id").eq("parent_id", parent.id).eq("student_id", id).maybeSingle(),
    );
    if (!link) throw new HttpError(404, "Child not found.");
    return json(await resetStudentPin(id));
  }

  throw new HttpError(404, "Not found.");
});
