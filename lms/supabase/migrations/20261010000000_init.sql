-- FinFun LMS — core schema. Requirement IDs (ACC-1, PAY-3, …) refer to the FinFun LMS Backend PRD.
-- Money is integer paise. Times are timestamptz (UTC), shown in IST by the apps.

create extension if not exists pg_cron with schema pg_catalog;

-- ── Types ────────────────────────────────────────────────────────────────────
create type public.app_role as enum ('parent', 'student', 'trainer', 'school_admin', 'teacher', 'partner_viewer', 'admin');
create type public.org_type as enum ('school', 'csr', 'government');
create type public.enrolment_status as enum ('pending', 'active', 'waitlisted', 'completed', 'refunded', 'expired');
create type public.order_status as enum ('created', 'paid', 'failed', 'refunded');
create type public.session_status as enum ('scheduled', 'live', 'completed', 'cancelled');
create type public.attendance_status as enum ('present', 'late', 'absent');
create type public.progress_status as enum ('not_started', 'in_progress', 'done');
create type public.rubric_stage as enum ('baseline', 'endline');

-- ── People and organisations ─────────────────────────────────────────────────
create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  type public.org_type not null,
  name text not null,
  district text,
  state text,
  created_at timestamptz not null default now()
);

-- One row per Supabase Auth user. Role comes from app_metadata, which only the service role can set.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role public.app_role not null default 'parent',
  org_id uuid references public.organisations,
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organisations on delete cascade,
  grade smallint not null check (grade between 3 and 10),
  name text not null,
  teacher_id uuid references public.profiles on delete set null
);

-- Children's data lives only here (DPDP data minimisation: first name, nickname, grade).
-- ponytail: first_name is stored in plain text; add column encryption before real children's data goes in.
create table public.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users on delete set null,
  org_id uuid references public.organisations,
  section_id uuid references public.sections on delete set null,
  first_name text not null check (length(first_name) between 1 and 40),
  nickname text check (length(nickname) <= 30),
  grade smallint not null check (grade between 3 and 10),
  username text not null unique check (username ~ '^[a-z0-9]{3,30}$'),
  language text not null default 'en',
  failed_logins smallint not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table public.guardian_links (
  parent_id uuid not null references public.profiles on delete cascade,
  student_id uuid not null references public.students on delete cascade,
  relation text not null default 'parent',
  primary key (parent_id, student_id)
);
create index on public.guardian_links (student_id);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles on delete cascade,
  student_id uuid not null references public.students on delete cascade,
  policy_version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  ip inet
);

-- ── Catalog ──────────────────────────────────────────────────────────────────
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  grade_min smallint not null,
  grade_max smallint not null,
  price_paise integer not null check (price_paise >= 0),
  description text,
  sticker text,
  active boolean not null default true
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs on delete cascade,
  position smallint not null,
  title text not null,
  unique (program_id, position)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules on delete cascade,
  position smallint not null,
  title text not null,
  unique (module_id, position)
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons on delete cascade,
  position smallint not null,
  kind text not null check (kind in ('slides', 'video', 'pdf', 'quiz', 'game', 'activity')),
  title text not null,
  asset_path text, -- path in the private "content" storage bucket
  language text not null default 'en',
  duration_min smallint,
  unique (lesson_id, position, language)
);

-- ── Batches and live sessions ────────────────────────────────────────────────
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs,
  trainer_id uuid references public.profiles on delete set null,
  section_id uuid references public.sections on delete set null, -- set for school (B2B) batches
  name text not null,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null, -- IST
  start_date date not null,
  session_count smallint not null default 12,
  duration_min smallint not null default 60,
  seat_limit smallint not null default 25,
  status text not null default 'open' check (status in ('open', 'running', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.holidays (
  day date primary key,
  name text not null
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches on delete cascade,
  number smallint not null,
  starts_at timestamptz not null,
  duration_min smallint not null default 60,
  status public.session_status not null default 'scheduled',
  zoom_meeting_id text, -- never readable by clients (see column grants below)
  zoom_passcode text,
  recording_path text, -- path in the private "recordings" bucket
  unique (batch_id, number)
);

-- ── Enrolment and payments ───────────────────────────────────────────────────
create table public.enrolments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students on delete cascade,
  program_id uuid not null references public.programs,
  batch_id uuid references public.batches,
  status public.enrolment_status not null default 'pending',
  source text not null default 'b2c' check (source in ('b2c', 'school', 'gift', 'graphy')),
  expires_at timestamptz, -- unpaid enrolments expire (PAY-1)
  created_at timestamptz not null default now()
);
create unique index enrolments_one_open on public.enrolments (student_id, program_id)
  where status in ('pending', 'active', 'waitlisted');
create index on public.enrolments (batch_id);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  kind text not null check (kind in ('percent', 'flat')),
  value integer not null check (value > 0), -- percent: 1–100; flat: paise
  program_ids uuid[], -- null = every program
  max_uses integer,
  per_parent_limit smallint not null default 1,
  expires_at timestamptz,
  active boolean not null default true
);

create sequence public.invoice_no_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles,
  enrolment_id uuid not null references public.enrolments,
  amount_paise integer not null check (amount_paise >= 0),
  discount_paise integer not null default 0,
  coupon_id uuid references public.coupons,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  status public.order_status not null default 'created',
  invoice_no bigint unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index on public.orders (parent_id);
create index on public.orders (coupon_id) where status = 'paid';

-- ── Learning, gamification, assessment ───────────────────────────────────────
create table public.attendance (
  session_id uuid not null references public.sessions on delete cascade,
  student_id uuid not null references public.students on delete cascade,
  status public.attendance_status not null,
  minutes smallint,
  source text not null default 'auto' check (source in ('auto', 'manual')),
  primary key (session_id, student_id)
);

create table public.progress (
  student_id uuid not null references public.students on delete cascade,
  content_item_id uuid not null references public.content_items on delete cascade,
  status public.progress_status not null default 'in_progress',
  score smallint,
  attempts smallint not null default 0,
  completed_at timestamptz,
  primary key (student_id, content_item_id)
);

create table public.rubric_skills (
  id smallint primary key,
  name text not null
);

create table public.rubric_levels (
  level smallint primary key,
  name text not null,
  label text not null
);

create table public.rubric_scores (
  student_id uuid not null references public.students on delete cascade,
  program_id uuid not null references public.programs,
  skill_id smallint not null references public.rubric_skills,
  stage public.rubric_stage not null,
  level smallint not null references public.rubric_levels,
  assessor_id uuid references public.profiles on delete set null,
  recorded_at timestamptz not null default now(),
  primary key (student_id, program_id, skill_id, stage)
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image text,
  rule jsonb not null default '{}' -- evaluated by the badge job (GAM-1)
);

create table public.badge_awards (
  badge_id uuid not null references public.badges on delete cascade,
  student_id uuid not null references public.students on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (badge_id, student_id)
);

create table public.points_ledger ( -- FinCoins: simulated, never redeemable (GAM-2)
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index on public.points_ledger (student_id);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students on delete cascade,
  program_id uuid not null references public.programs,
  verify_code text not null unique default encode(extensions.gen_random_bytes(8), 'hex'),
  issued_at timestamptz not null default now(),
  pdf_path text,
  unique (student_id, program_id)
);

-- ── Notifications and audit ──────────────────────────────────────────────────
create table public.notifications (
  id bigint generated always as identity primary key,
  recipient_id uuid not null references public.profiles on delete cascade,
  channel text not null check (channel in ('whatsapp', 'email', 'sms')),
  template text not null,
  payload jsonb not null default '{}',
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ponytail: before/after snapshots copy children's names; erasure (DPDP withdrawal) must purge matching audit rows too.
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid, -- null when the change came from an Edge Function (service role)
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  at timestamptz not null default now()
);

-- ── Helper functions (security definer so RLS policies can call them without recursion) ──
create function public.my_role() returns public.app_role
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(public.my_role() = 'admin', false)
$$;

-- Students the caller may see as family: themselves (student login) or their children (parent login).
create function public.my_student_ids() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select id from public.students where auth_user_id = auth.uid()
  union
  select student_id from public.guardian_links where parent_id = auth.uid()
$$;

-- Batches the caller teaches: as the trainer, or as the teacher of the batch's school section.
create function public.my_teaching_batch_ids() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select id from public.batches where trainer_id = auth.uid()
  union
  select b.id from public.batches b join public.sections s on s.id = b.section_id where s.teacher_id = auth.uid()
$$;

-- Batches the caller can see the timetable of: ones they teach, plus their family's enrolled batches.
create function public.my_batch_ids() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select public.my_teaching_batch_ids()
  union
  select batch_id from public.enrolments
  where batch_id is not null and status in ('active', 'completed')
    and student_id in (select public.my_student_ids())
$$;

create function public.teaches_student(p_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.enrolments
    where student_id = p_student and batch_id in (select public.my_teaching_batch_ids())
  ) or exists (
    select 1 from public.students s join public.profiles p on p.id = auth.uid()
    where s.id = p_student and p.role = 'school_admin' and s.org_id = p.org_id
  )
$$;

-- ── Triggers ─────────────────────────────────────────────────────────────────
-- Also runs on update: Supabase Auth writes app_metadata (where the role lives) after inserting the user.
create function public.sync_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, role, phone, email)
  values (new.id, coalesce((new.raw_app_meta_data ->> 'role')::public.app_role, 'parent'), new.phone, new.email)
  on conflict (id) do update
    set role = coalesce((new.raw_app_meta_data ->> 'role')::public.app_role, public.profiles.role);
  return new;
end $$;

create trigger sync_profile after insert or update of raw_app_meta_data on auth.users
  for each row execute function public.sync_profile();

create function public.audit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (actor_id, action, entity, entity_id, before, after)
  values (auth.uid(), lower(tg_op), tg_table_name,
          coalesce(to_jsonb(new), to_jsonb(old)) ->> 'id',
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

create trigger audit after insert or update or delete on public.students for each row execute function public.audit();
create trigger audit after insert or update or delete on public.guardian_links for each row execute function public.audit();
create trigger audit after insert or update or delete on public.consents for each row execute function public.audit();
create trigger audit after insert or update or delete on public.enrolments for each row execute function public.audit();
create trigger audit after insert or update or delete on public.orders for each row execute function public.audit();

-- ── Business functions ───────────────────────────────────────────────────────
-- Creates the child, links the parent and records consent in one transaction (ACC-2, DPDP consent).
create function public.add_child(
  p_parent uuid, p_auth_user uuid, p_first_name text, p_nickname text, p_grade smallint,
  p_username text, p_policy_version text, p_ip inet
) returns public.students
language plpgsql security definer set search_path = '' as $$
declare s public.students;
begin
  insert into public.students (auth_user_id, first_name, nickname, grade, username)
  values (p_auth_user, p_first_name, p_nickname, p_grade, p_username)
  returning * into s;
  insert into public.guardian_links (parent_id, student_id) values (p_parent, s.id);
  insert into public.consents (parent_id, student_id, policy_version, ip) values (p_parent, s.id, p_policy_version, p_ip);
  return s;
end $$;

-- Counts a failed student login atomically; 5 in a row locks the login for 15 minutes (ACC-6).
create function public.student_login_failed(p_student uuid) returns void
language sql security definer set search_path = '' as $$
  update public.students set
    failed_logins = case when failed_logins + 1 >= 5 then 0 else failed_logins + 1 end,
    locked_until = case when failed_logins + 1 >= 5 then now() + interval '15 minutes' else locked_until end
  where id = p_student
$$;

-- Marks an order paid and activates its enrolment. Safe to call twice: payment webhooks retry (PAY-2).
create function public.mark_order_paid(p_order uuid, p_payment_id text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception 'unknown order %', p_order; end if;
  if o.status = 'paid' then return o.enrolment_id; end if;
  update public.orders set
    status = 'paid', razorpay_payment_id = p_payment_id, paid_at = now(),
    invoice_no = case when o.amount_paise > 0 then nextval('public.invoice_no_seq') end
  where id = o.id;
  -- An expired enrolment is revived too: the money arrived, so the seat is owed.
  update public.enrolments set status = 'active', expires_at = null
  where id = o.enrolment_id and status in ('pending', 'expired');
  return o.enrolment_id;
end $$;

-- Puts a paid enrolment into a batch, or on that batch's waitlist when it's full (PAY-5).
create function public.assign_batch(p_enrolment uuid, p_batch uuid) returns public.enrolment_status
language plpgsql security definer set search_path = '' as $$
declare e public.enrolments; b public.batches; taken int; result public.enrolment_status;
begin
  select * into e from public.enrolments where id = p_enrolment for update;
  if not found or (auth.uid() is not null and not public.is_admin()
      and e.student_id not in (select student_id from public.guardian_links where parent_id = auth.uid())) then
    raise exception 'enrolment not found' using errcode = 'P0002';
  end if;
  if e.status not in ('active', 'waitlisted') then raise exception 'enrolment is not paid yet'; end if;
  if e.batch_id is not null and e.status = 'active' then raise exception 'already in a batch; ask support to transfer'; end if;

  select * into b from public.batches where id = p_batch for update; -- serialises seat counting per batch
  if not found or b.program_id <> e.program_id or b.status <> 'open' then raise exception 'batch not available'; end if;

  select count(*) into taken from public.enrolments where batch_id = b.id and status = 'active';
  update public.enrolments
  set batch_id = b.id, status = case when taken < b.seat_limit then 'active' else 'waitlisted' end::public.enrolment_status
  where id = e.id
  returning status into result;
  return result;
end $$;

-- Builds a batch's session calendar from its weekly slot, skipping holidays (BAT-2).
create function public.generate_sessions(p_batch uuid) returns integer
language plpgsql security definer set search_path = '' as $$
declare b public.batches; d date; n int := 0;
begin
  select * into strict b from public.batches where id = p_batch;
  d := b.start_date + ((b.weekday - extract(dow from b.start_date)::int + 7) % 7);
  while n < b.session_count loop
    if not exists (select 1 from public.holidays where day = d) then
      n := n + 1;
      insert into public.sessions (batch_id, number, starts_at, duration_min)
      values (b.id, n, (d + b.start_time) at time zone 'Asia/Kolkata', b.duration_min)
      on conflict (batch_id, number) do nothing;
    end if;
    d := d + 7;
  end loop;
  return n;
end $$;

-- Public certificate check: first name and program only (CRT-2).
create function public.verify_certificate(p_code text)
returns table (first_name text, program text, issued_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select s.first_name, p.name, c.issued_at
  from public.certificates c
  join public.students s on s.id = c.student_id
  join public.programs p on p.id = c.program_id
  where c.verify_code = p_code
$$;

-- Only Edge Functions (service role) may call these; clients get assign_batch and verify_certificate.
revoke execute on function public.add_child, public.student_login_failed, public.mark_order_paid, public.generate_sessions
  from public, anon, authenticated;

-- Unpaid enrolments expire 72 hours after they're created.
select cron.schedule('expire-pending-enrolments', '15 * * * *',
  $$update public.enrolments set status = 'expired' where status = 'pending' and expires_at < now()$$);

-- ── Row-level security ───────────────────────────────────────────────────────
-- Every table: RLS on, and FinFun admins can do everything.
do $$
declare t text;
begin
  foreach t in array array[
    'organisations', 'profiles', 'sections', 'students', 'guardian_links', 'consents', 'programs', 'modules',
    'lessons', 'content_items', 'batches', 'holidays', 'sessions', 'enrolments', 'coupons', 'orders',
    'attendance', 'progress', 'rubric_skills', 'rubric_levels', 'rubric_scores', 'badges', 'badge_awards',
    'points_ledger', 'certificates', 'notifications', 'audit_log'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Public catalog, readable before login (the marketing site reads prices from here — CAT-1).
create policy read_all on public.programs for select to anon, authenticated using (active);
create policy read_all on public.modules for select to anon, authenticated using (true);
create policy read_all on public.lessons for select to anon, authenticated using (true);
create policy read_all on public.rubric_skills for select to anon, authenticated using (true);
create policy read_all on public.rubric_levels for select to anon, authenticated using (true);
create policy read_all on public.badges for select to anon, authenticated using (true);
create policy read_all on public.holidays for select to anon, authenticated using (true);
create policy read_all on public.content_items for select to authenticated using (true); -- files stay in a private bucket

create policy own_read on public.profiles for select to authenticated using (id = auth.uid());
create policy own_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated; -- role and org are never self-editable

create policy member on public.organisations for select to authenticated
  using (id = (select org_id from public.profiles where id = auth.uid()));
create policy member on public.sections for select to authenticated
  using (org_id = (select org_id from public.profiles where id = auth.uid()));

create policy family_or_teacher on public.students for select to authenticated
  using (id in (select public.my_student_ids()) or public.teaches_student(id));
create policy parent_edits on public.students for update to authenticated
  using (id in (select student_id from public.guardian_links where parent_id = auth.uid()));
revoke update on public.students from authenticated;
grant update (nickname, language) on public.students to authenticated;

create policy own on public.guardian_links for select to authenticated using (parent_id = auth.uid());
create policy own on public.consents for select to authenticated using (parent_id = auth.uid());
create policy own on public.orders for select to authenticated using (parent_id = auth.uid());
create policy own on public.notifications for select to authenticated using (recipient_id = auth.uid());

create policy visible on public.batches for select to authenticated
  using (status in ('open', 'running') or id in (select public.my_batch_ids()));

create policy timetable on public.sessions for select to authenticated using (batch_id in (select public.my_batch_ids()));
revoke select on public.sessions from anon, authenticated; -- hides zoom_meeting_id / zoom_passcode
grant select (id, batch_id, number, starts_at, duration_min, status, recording_path) on public.sessions to authenticated;

create policy family_or_teacher on public.enrolments for select to authenticated
  using (student_id in (select public.my_student_ids()) or batch_id in (select public.my_teaching_batch_ids()));

create policy family_or_teacher on public.attendance for select to authenticated
  using (student_id in (select public.my_student_ids()) or public.teaches_student(student_id));
create policy teacher_marks on public.attendance for insert to authenticated
  with check (public.teaches_student(student_id));
create policy teacher_corrects on public.attendance for update to authenticated
  using (public.teaches_student(student_id));

create policy family on public.progress for select to authenticated using (student_id in (select public.my_student_ids()));
create policy family on public.badge_awards for select to authenticated using (student_id in (select public.my_student_ids()));
create policy family on public.points_ledger for select to authenticated using (student_id in (select public.my_student_ids()));
create policy family on public.certificates for select to authenticated using (student_id in (select public.my_student_ids()));

create policy family_or_teacher on public.rubric_scores for select to authenticated
  using (student_id in (select public.my_student_ids()) or public.teaches_student(student_id));
create policy teacher_grades on public.rubric_scores for insert to authenticated
  with check (public.teaches_student(student_id) and assessor_id = auth.uid());
create policy teacher_regrades on public.rubric_scores for update to authenticated
  using (public.teaches_student(student_id)) with check (assessor_id = auth.uid());

-- ── Storage buckets (all private; apps get short-lived signed URLs) ─────────────
insert into storage.buckets (id, name, public) values
  ('content', 'content', false),
  ('recordings', 'recordings', false),
  ('certificates', 'certificates', false),
  ('uploads', 'uploads', false);
