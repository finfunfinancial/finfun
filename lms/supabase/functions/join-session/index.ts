// "Join live session" for a signed-in student (BAT-3, LRN-1). Returns what the Zoom Meeting SDK needs to
// open the class inside app.finfun.club — no Zoom account, link or passcode is ever shown to the child.
//   POST /join-session { sessionId } → { sdkKey, signature, meetingNumber, passcode, userName, customerKey }
import { admin, caller, must, UUID } from "../_shared/db.ts";
import { HttpError, json, readJson, serve } from "../_shared/http.ts";
import * as zoom from "../_shared/zoom.ts";

const EARLY_MIN = 10;

serve(async (req) => {
  const me = await caller(req, "student");
  const { sessionId } = await readJson<{ sessionId: string }>(req);
  if (!sessionId || !UUID.test(sessionId)) throw new HttpError(422, "Which class?");

  const [student, session] = await Promise.all([
    admin.from("students").select("id, first_name, nickname").eq("auth_user_id", me.id).single().then(must),
    admin.from("sessions").select("batch_id, starts_at, duration_min, status, zoom_meeting_id, zoom_passcode").eq("id", sessionId)
      .maybeSingle().then(must),
  ]);
  const enrolled = session && must(
    await admin.from("enrolments").select("id").eq("student_id", student.id).eq("batch_id", session.batch_id).eq("status", "active")
      .maybeSingle(),
  );
  if (!session || !enrolled) throw new HttpError(404, "This class isn't on your timetable.");

  const start = Date.parse(session.starts_at);
  if (session.status === "cancelled") throw new HttpError(410, "This class was cancelled.");
  if (Date.now() < start - EARLY_MIN * 60e3) throw new HttpError(403, `You can join ${EARLY_MIN} minutes before class starts.`);
  if (Date.now() > start + session.duration_min * 60e3) {
    throw new HttpError(410, "This class has ended. The recording will appear here soon.");
  }
  if (!session.zoom_meeting_id) throw new HttpError(503, "The class isn't ready yet. Please tell your trainer.");

  const { sdkKey, signature } = await zoom.sdkSignature(session.zoom_meeting_id, 0); // 503 until Zoom is set up
  return json({
    sdkKey,
    signature,
    meetingNumber: session.zoom_meeting_id,
    passcode: session.zoom_passcode,
    userName: student.nickname || student.first_name,
    customerKey: student.id, // shows up in Zoom's participant report → attendance (BAT-4)
  });
});
