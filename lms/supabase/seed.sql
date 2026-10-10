-- Local development data only. `supabase db reset` loads it; production never does.

-- Test coupons. The real festive discount is still a TODO on the site.
insert into public.coupons (code, kind, value) values
  ('FESTIVE', 'percent', 10),
  ('TESTFREE', 'percent', 100);

-- One open Pro batch, Saturdays 10:00 IST, starting today.
insert into public.batches (program_id, name, weekday, start_time, start_date)
select id, 'Pro · Saturday 10 AM', 6, '10:00', current_date from public.programs where slug = 'pro';

select public.generate_sessions(id) from public.batches;

-- A sample lesson in Pro's first module: two activities and a quiz with its answer key.
with m as (select m.id from public.modules m join public.programs p on p.id = m.program_id where p.slug = 'pro' and m.position = 1),
l as (insert into public.lessons (module_id, position, title) select id, 1, 'Need it or want it?' from m returning id)
insert into public.content_items (lesson_id, position, kind, title, asset_path, duration_min, quiz)
select l.id, x.position, x.kind, x.title, x.asset_path, x.duration_min, x.quiz::jsonb from l, (values
  (1, 'activity', 'Ask a parent: what did our family buy this week?', null, 5, null),
  (2, 'activity', 'Sort your last 5 buys into needs and wants', null, 10, null),
  (3, 'quiz', 'Quick check', null, 3,
   '[{"q":"Which of these is a need?","options":["School shoes","A new video game","Movie tickets"]},
     {"q":"Before buying something, the best question is…","options":["Is it on sale?","Do I really need it?","Do my friends have it?"]}]')
) as x(position, kind, title, asset_path, duration_min, quiz);

insert into public.quiz_keys (content_item_id, answers)
select id, '{0,1}' from public.content_items where title = 'Quick check';
