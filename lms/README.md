# FinFun LMS

Supabase backend for finfun.club accounts: buyers, their children's courses, payments, live batches, lessons, quizzes and certificates. Built to the *FinFun LMS Backend PRD*; requirement IDs in comments (ACC-1, PAY-3…) point to it.

The screens live in the website itself (the Next.js app one folder up), not in a separate app:

| Page | Who | What |
| --- | --- | --- |
| `/login` | Everyone | Sign up or log in with mobile or email + a 6-digit code |
| `/enrol` | Buyers | Pick or add the child (first name + grade), coupon, pay; then the course appears in My courses |
| `/my-courses` | Buyers | Courses they bought: pick a class time, next live class, lessons and quizzes, badges, recordings, certificate |
| `/admin` | FinFun admins | Dashboard, courses and lessons (files, quizzes), batches and classes (Zoom, recordings, attendance, certificates), users, orders (mark offline payments paid, CSV), coupons |
| `/verify/<code>` | Anyone | Public certificate check |

One login per buyer: the child is a learner record under the buyer's account, with no login of its own.

Website settings (`site/.env.local`, and the website's Vercel project):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY` — production URL + publishable key. Without them `/login` shows the old page and `/admin` says "being set up".
- `NEXT_PUBLIC_ONLINE_CHECKOUT=on` — makes `/enrol` the log-in-and-pay checkout. Leave it off until parents can receive login codes (MSG91 SMS or your own email provider in Supabase); until then the old enrol form keeps collecting leads.

Local test logins (after `supabase db reset`, run `node scripts/dev-users.mjs`), with the website running on http://localhost:3100:
- Admin `admin@finfun.test` — the 6-digit code arrives in Mailpit, http://127.0.0.1:54324
- Buyers: phone `99999 00001` or `99999 00002`, code `123456`
- Coupon `TESTFREE` enrols for free, so you can try My courses without payments

First production admin: create the user in Supabase → Authentication → Users (auto-confirm), then run in the SQL Editor:
```sql
update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'technology@finfun.club';
```
Production login emails must show the code: Authentication → Email Templates → "Magic Link" and "Confirm signup" → use `supabase/templates/login-code.html`.

## Run the backend locally
Needs Docker Desktop running and the Supabase CLI (`brew install supabase/tap/supabase`).

```bash
supabase start          # first run downloads ~5 GB of images
supabase db reset       # rebuild the database from migrations + seed.sql
supabase functions serve
node --test supabase/functions/_shared/logic.test.ts
```

`supabase start` prints the local URLs and keys. Studio (the database UI) is at http://127.0.0.1:54323.

Local test logins:
- Parent: phone `+91 99999 00001`, OTP `123456` (no SMS is sent).
- Coupons: `FESTIVE` (10%, placeholder) and `TESTFREE` (100%, skips payment).

End-to-end check (local only): `supabase db reset && node scripts/smoke.mjs`.

## Deploy (production `klklvbhnddpcwfqnxtds`, Mumbai)
Staging (test data only): `mgrylyuswdfzamkxralk` (Tokyo).
```bash
supabase link --project-ref klklvbhnddpcwfqnxtds   # asks for the database password
supabase db push                                   # applies migrations; seed.sql is never pushed
supabase secrets set STUDENT_PIN_PEPPER=$(openssl rand -hex 32)   # once, never change it afterwards
supabase functions deploy
```
Never run `supabase config push`: `config.toml` holds local-only test OTP numbers and a dummy SMS provider. Set production Auth (phone OTP via MSG91, SMTP, site URL) in the dashboard.

## Where things live
| What | File |
| --- | --- |
| Tables, security rules (RLS), database functions | `supabase/migrations/20261010000000_init.sql` |
| Local test data (programs, rubric, coupons, a Pro batch) | `supabase/seed.sql` |
| Auth and function settings | `supabase/config.toml` |
| Edge Functions | `supabase/functions/<name>/index.ts` |
| Shared helpers (HTTP, DB, pricing, student login) | `supabase/functions/_shared/` |
| Razorpay and Zoom adapters (**empty for now**) | `supabase/functions/_shared/razorpay.ts`, `zoom.ts` |
| Secrets list | `supabase/functions/.env.example` |

## API
Apps read data directly with `supabase-js`; row-level security decides what each role sees. Everything that needs checks or secrets is an Edge Function (`POST /functions/v1/<name>`):

| Function | Who | Does |
| --- | --- | --- |
| `student-login` | School students (not used yet) | Username + PIN → session; 5 wrong PINs lock it for 15 minutes |
| `enrolments` | Buyer | Price with coupon (`dryRun`); saves a new child with consent; creates the enrolment and Razorpay order |
| `razorpay-webhook` | Razorpay | Marks the order paid and activates the enrolment |
| `join-session` | Buyer | Checks the child's timetable, returns what the Zoom Meeting SDK needs to join in-page |
| `admin` | Admin | Add staff, change roles, reset PINs, mark offline payments paid, bulk-import school students |

Database functions callable from the apps: `assign_batch` (parent picks a batch; waitlists when full), `complete_item` and `submit_quiz` (students; quizzes are graded on the server and the answer key is never readable), `complete_session` (trainers), `generate_sessions` and `issue_certificates` (admins), `verify_certificate` (public). Points (FinCoins) and badges are awarded automatically on attendance, activities and quizzes.

Reading `sessions`: list the columns you need — the Zoom meeting id and passcode are hidden from apps, so `select('*')` is refused.

## School student logins (not used yet)
The school tools (sections, bulk logins) are kept in the backend for later. Each child is a hidden Supabase Auth user (`<username>@students.finfun.club`, never emailed). Their password is an HMAC of username + PIN with `STUDENT_PIN_PEPPER`, so PINs can only be tried through `student-login` and its lockout. Never change the pepper without resetting every PIN.

## Status
Working: schema and RLS, parent/child accounts, student login, enrolment with coupons, free (₹0) enrolments, offline payments marked by admins, batch choice with waitlist, session calendar, attendance, rubric, lessons and quizzes, FinCoins and badges, certificates with public verification, school sections with bulk logins, admin portal, trainer, parent and student apps.

Waiting on keys (the code paths exist; the adapters return a polite "not switched on yet"):
- **Razorpay** — `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- **Zoom** — `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` (Server-to-Server OAuth app) and `ZOOM_SDK_KEY`, `ZOOM_SDK_SECRET` (Meeting SDK app)
- **MSG91** for production parent OTP (DLT-registered), connected through Supabase Auth's Send SMS hook

Next up: WhatsApp/email notifications, Zoom Meeting SDK inside the join button, attendance import from Zoom reports, impact report PDF, vernacular content switching, refunds.
