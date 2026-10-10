-- Learning features: quizzes, activity completion, points and badges, certificates, content files.

-- ── Quizzes (LRN-3) ──────────────────────────────────────────────────────────
-- Questions sit on the content item; the answer key sits apart so students can never read it.
alter table public.content_items add column quiz jsonb; -- [{ "q": "Question?", "options": ["A", "B", "C"] }]

create table public.quiz_keys (
  content_item_id uuid primary key references public.content_items on delete cascade,
  answers smallint[] not null -- index of the right option per question, 0-based
);
alter table public.quiz_keys enable row level security;
create policy admin_all on public.quiz_keys for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Apps can't read Zoom ids, so expose just whether a session has a meeting yet.
alter table public.sessions add column has_zoom boolean generated always as (zoom_meeting_id is not null) stored;
grant select (has_zoom) on public.sessions to authenticated;

-- ── Helpers ──────────────────────────────────────────────────────────────────
create function public.my_student_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.students where auth_user_id = auth.uid()
$$;

-- True when the student is enrolled (paid or finished) in the program that owns this content item.
create function public.can_open_item(p_student uuid, p_item uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.content_items ci
    join public.lessons l on l.id = ci.lesson_id
    join public.modules m on m.id = l.module_id
    join public.enrolments e on e.program_id = m.program_id
    where ci.id = p_item and e.student_id = p_student and e.status in ('active', 'completed')
  )
$$;

-- Awards every badge whose rule the student now meets (GAM-1). Rules are data:
--   {"attended_sessions": n} · {"module_done": "<module title>"} · {"quiz_perfect": true} · {"points": n}
create function public.award_badges(p_student uuid) returns void
language sql security definer set search_path = '' as $$
  insert into public.badge_awards (badge_id, student_id)
  select b.id, p_student from public.badges b
  where (
    (b.rule ? 'attended_sessions' and (
      select count(*) from public.attendance a where a.student_id = p_student and a.status in ('present', 'late')
    ) >= (b.rule ->> 'attended_sessions')::int)
    or (b.rule ? 'module_done' and exists (
      select 1 from public.modules m
      join public.enrolments e on e.program_id = m.program_id and e.student_id = p_student and e.status in ('active', 'completed')
      where m.title = b.rule ->> 'module_done'
        and exists (select 1 from public.lessons l join public.content_items ci on ci.lesson_id = l.id where l.module_id = m.id)
        and not exists (
          select 1 from public.lessons l join public.content_items ci on ci.lesson_id = l.id
          where l.module_id = m.id and ci.language = 'en'
            and not exists (select 1 from public.progress p where p.student_id = p_student and p.content_item_id = ci.id and p.status = 'done')
        )
    ))
    or (b.rule ? 'quiz_perfect' and exists (
      select 1 from public.progress p join public.content_items ci on ci.id = p.content_item_id
      where p.student_id = p_student and ci.kind = 'quiz' and p.score = 100
    ))
    or (b.rule ? 'points' and (
      select coalesce(sum(points), 0) from public.points_ledger where student_id = p_student
    ) >= (b.rule ->> 'points')::int)
  )
  on conflict do nothing
$$;

-- ── Student actions ──────────────────────────────────────────────────────────
-- Marks a non-quiz activity done for the signed-in student; first completion earns 10 FinCoins (LRN-2, GAM-2).
create function public.complete_item(p_item uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare sid uuid := public.my_student_id();
begin
  if sid is null or not public.can_open_item(sid, p_item) then
    raise exception 'not enrolled in this program' using errcode = '42501';
  end if;
  if (select kind from public.content_items where id = p_item) = 'quiz' then
    raise exception 'quizzes are completed by submitting answers';
  end if;
  if exists (select 1 from public.progress where student_id = sid and content_item_id = p_item and status = 'done') then
    return;
  end if;
  insert into public.progress (student_id, content_item_id, status, attempts, completed_at)
  values (sid, p_item, 'done', 1, now())
  on conflict (student_id, content_item_id) do update set status = 'done', completed_at = now();
  insert into public.points_ledger (student_id, points, reason) values (sid, 10, 'Finished an activity');
  perform public.award_badges(sid);
end $$;

-- Grades a quiz on the server. 60% passes; the best score is kept; first pass earns 20 FinCoins (LRN-3).
-- Returns {score, passed, results: [true|false per question]} — never the right answers.
create function public.submit_quiz(p_item uuid, p_answers smallint[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  sid uuid := public.my_student_id();
  key smallint[];
  total int;
  right_count int := 0;
  results jsonb := '[]';
  score int;
  passed boolean;
  was_done boolean;
begin
  if sid is null or not public.can_open_item(sid, p_item) then
    raise exception 'not enrolled in this program' using errcode = '42501';
  end if;
  select answers into key from public.quiz_keys where content_item_id = p_item;
  total := coalesce(array_length(key, 1), 0);
  if total = 0 then raise exception 'this quiz has no answer key yet'; end if;

  for i in 1..total loop
    results := results || to_jsonb(p_answers[i] is not distinct from key[i]);
    if p_answers[i] is not distinct from key[i] then right_count := right_count + 1; end if;
  end loop;
  score := round(100.0 * right_count / total);
  passed := score >= 60;

  select coalesce(bool_or(status = 'done'), false) into was_done
  from public.progress where student_id = sid and content_item_id = p_item;

  insert into public.progress (student_id, content_item_id, status, score, attempts, completed_at)
  values (sid, p_item, case when passed then 'done' else 'in_progress' end::public.progress_status, score, 1,
          case when passed then now() end)
  on conflict (student_id, content_item_id) do update set
    attempts = public.progress.attempts + 1,
    score = greatest(coalesce(public.progress.score, 0), excluded.score),
    status = case when public.progress.status = 'done' or excluded.status = 'done' then 'done' else 'in_progress' end::public.progress_status,
    completed_at = coalesce(public.progress.completed_at, excluded.completed_at);

  if passed and not was_done then
    insert into public.points_ledger (student_id, points, reason) values (sid, 20, 'Passed a quiz');
  end if;
  perform public.award_badges(sid);
  return jsonb_build_object('score', score, 'passed', passed, 'results', results);
end $$;

-- Attending class earns 5 FinCoins and may unlock attendance badges.
create function public.on_attendance() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status in ('present', 'late') and (tg_op = 'INSERT' or old.status = 'absent') then
    insert into public.points_ledger (student_id, points, reason) values (new.student_id, 5, 'Attended class');
    perform public.award_badges(new.student_id);
  end if;
  return new;
end $$;
create trigger points after insert or update of status on public.attendance
  for each row execute function public.on_attendance();

revoke execute on function public.award_badges, public.can_open_item from public, anon, authenticated;

-- ── Staff actions ────────────────────────────────────────────────────────────
-- Admins may now build session calendars from the portal; everyone else still can't.
create or replace function public.generate_sessions(p_batch uuid) returns integer
language plpgsql security definer set search_path = '' as $$
declare b public.batches; d date; n int := 0;
begin
  if auth.uid() is not null and not public.is_admin() then raise exception 'admins only' using errcode = '42501'; end if;
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
grant execute on function public.generate_sessions to authenticated;

-- Trainers mark a class as held when they save attendance (they can't edit sessions otherwise).
create function public.complete_session(p_session uuid) returns void
language sql security definer set search_path = '' as $$
  update public.sessions set status = 'completed'
  where id = p_session and status <> 'cancelled'
    and (public.is_admin() or batch_id in (select public.my_teaching_batch_ids()))
$$;

-- Issues certificates for a batch (CRT-1): 75% attendance of its non-cancelled sessions and every
-- quiz in the program passed. Finishers' enrolments become 'completed'. Returns how many were issued.
create function public.issue_certificates(p_batch uuid) returns integer
language plpgsql security definer set search_path = '' as $$
declare b public.batches; held int; issued int;
begin
  if auth.uid() is not null and not public.is_admin() then raise exception 'admins only' using errcode = '42501'; end if;
  select * into strict b from public.batches where id = p_batch;
  select count(*) into held from public.sessions where batch_id = b.id and status <> 'cancelled';

  with finishers as (
    select e.id as enrolment_id, e.student_id from public.enrolments e
    where e.batch_id = b.id and e.status in ('active', 'completed')
      and (select count(*) from public.attendance a join public.sessions s on s.id = a.session_id
           where a.student_id = e.student_id and s.batch_id = b.id and a.status in ('present', 'late')) >= ceil(held * 0.75)
      and not exists (
        select 1 from public.content_items ci
        join public.lessons l on l.id = ci.lesson_id join public.modules m on m.id = l.module_id
        where m.program_id = b.program_id and ci.kind = 'quiz' and ci.language = 'en'
          and not exists (select 1 from public.progress p where p.student_id = e.student_id and p.content_item_id = ci.id and p.status = 'done')
      )
  ), done as (
    update public.enrolments set status = 'completed' where id in (select enrolment_id from finishers)
  ), certs as (
    insert into public.certificates (student_id, program_id)
    select student_id, b.program_id from finishers
    on conflict (student_id, program_id) do nothing
    returning 1
  )
  select count(*) into issued from certs;
  return issued;
end $$;

-- ── Content files (private buckets) ──────────────────────────────────────────
create policy "logged-in users read course content" on storage.objects for select to authenticated
  using (bucket_id = 'content');
create policy "admins manage course content" on storage.objects for all to authenticated
  using (bucket_id = 'content' and public.is_admin()) with check (bucket_id = 'content' and public.is_admin());
create policy "batch members watch recordings" on storage.objects for select to authenticated
  using (bucket_id = 'recordings' and exists (
    select 1 from public.sessions s where s.recording_path = name and s.batch_id in (select public.my_batch_ids())
  ));
create policy "admins manage recordings" on storage.objects for all to authenticated
  using (bucket_id = 'recordings' and public.is_admin()) with check (bucket_id = 'recordings' and public.is_admin());

-- ── More badges ──────────────────────────────────────────────────────────────
insert into public.badges (slug, name, image, rule) values
  ('quiz-master', 'Quiz Master', '/a/gamification/badge-quiz-master.webp', '{"quiz_perfect": true}'),
  ('goal-getter', 'Goal Getter', '/a/gamification/badge-goal-getter.webp', '{"points": 100}');
