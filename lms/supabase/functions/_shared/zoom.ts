// Zoom adapter — EMPTY until FinFun has Zoom apps set up (see lms/README.md, "What's still needed").
// Two Zoom Marketplace apps:
//   Server-to-Server OAuth app → ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET (create meetings, reports, ZAK)
//   Meeting SDK app            → ZOOM_SDK_KEY, ZOOM_SDK_SECRET (students join inside our page, no Zoom login)
import { HttpError } from "./http.ts";

const notReady = () => new HttpError(503, "Live classes aren't connected yet. Please tell your trainer.");

/** Creates a meeting on the trainer's Zoom account for one session (BAT-3). */
export async function createMeeting(
  _hostEmail: string,
  _topic: string,
  _startsAt: string,
  _durationMin: number,
): Promise<{ id: string; passcode: string }> {
  // TODO(Zoom): POST https://api.zoom.us/v2/users/{hostEmail}/meetings with an S2S OAuth token.
  //   settings: join_before_host false, mute_upon_entry true, waiting_room false, auto_recording "cloud".
  throw notReady();
}

/** Meeting SDK signature so a student joins inside app.finfun.club. role 0 = attendee, 1 = host. */
export async function sdkSignature(_meetingNumber: string, _role: 0 | 1): Promise<{ sdkKey: string; signature: string }> {
  // TODO(Zoom): HS256 JWT signed with ZOOM_SDK_SECRET:
  //   { appKey: ZOOM_SDK_KEY, mn: meetingNumber, role, iat, exp: iat + 2h, tokenExp: iat + 2h }.
  throw notReady();
}

/** Host token so a trainer starts class without signing in to Zoom. */
export async function hostZak(_hostEmail: string): Promise<string> {
  // TODO(Zoom): GET https://api.zoom.us/v2/users/{hostEmail}/token?type=zak
  throw notReady();
}

/** Who attended a finished meeting; customerKey is the student id we passed at join (BAT-4). */
export async function participants(_meetingId: string): Promise<{ customerKey: string | null; minutes: number }[]> {
  // TODO(Zoom): GET https://api.zoom.us/v2/report/meetings/{meetingId}/participants (paginate), sum duration per key.
  throw notReady();
}
