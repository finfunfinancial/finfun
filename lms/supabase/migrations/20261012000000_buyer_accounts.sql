-- One login per buyer: whoever signs up and pays sees the course and learns from that account.
-- The child is a learner record (first name + grade) under the buyer, with no login of its own.

alter table public.students alter column username drop not null;

create function public.is_my_learner(p_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(p_student in (select public.my_student_ids()), false)
$$;

-- Learning actions now name the learner; the caller must be that learner's account.
drop function public.complete_item(uuid);
drop function public.submit_quiz(uuid, smallint[]);

-- Marks a non-quiz activity done; first completion earns 10 FinCoins (LRN-2, GAM-2).
create function public.complete_item(p_item uuid, p_student uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_my_learner(p_student) or not public.can_open_item(p_student, p_item) then
    raise exception 'not enrolled in this program' using errcode = '42501';
  end if;
  if (select kind from public.content_items where id = p_item) = 'quiz' then
    raise exception 'quizzes are completed by submitting answers';
  end if;
  if exists (select 1 from public.progress where student_id = p_student and content_item_id = p_item and status = 'done') then
    return;
  end if;
  insert into public.progress (student_id, content_item_id, status, attempts, completed_at)
  values (p_student, p_item, 'done', 1, now())
  on conflict (student_id, content_item_id) do update set status = 'done', completed_at = now();
  insert into public.points_ledger (student_id, points, reason) values (p_student, 10, 'Finished an activity');
  perform public.award_badges(p_student);
end $$;

-- Grades a quiz on the server. 60% passes; the best score is kept; first pass earns 20 FinCoins (LRN-3).
-- Returns {score, passed, results: [true|false per question]} — never the right answers.
create function public.submit_quiz(p_item uuid, p_student uuid, p_answers smallint[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  key smallint[];
  total int;
  right_count int := 0;
  results jsonb := '[]';
  score int;
  passed boolean;
  was_done boolean;
begin
  if not public.is_my_learner(p_student) or not public.can_open_item(p_student, p_item) then
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
  from public.progress where student_id = p_student and content_item_id = p_item;

  insert into public.progress (student_id, content_item_id, status, score, attempts, completed_at)
  values (p_student, p_item, case when passed then 'done' else 'in_progress' end::public.progress_status, score, 1,
          case when passed then now() end)
  on conflict (student_id, content_item_id) do update set
    attempts = public.progress.attempts + 1,
    score = greatest(coalesce(public.progress.score, 0), excluded.score),
    status = case when public.progress.status = 'done' or excluded.status = 'done' then 'done' else 'in_progress' end::public.progress_status,
    completed_at = coalesce(public.progress.completed_at, excluded.completed_at);

  if passed and not was_done then
    insert into public.points_ledger (student_id, points, reason) values (p_student, 20, 'Passed a quiz');
  end if;
  perform public.award_badges(p_student);
  return jsonb_build_object('score', score, 'passed', passed, 'results', results);
end $$;
