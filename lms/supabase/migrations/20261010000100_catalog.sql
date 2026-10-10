-- Catalog reference data: programs, topics, rubric, badges. Matches finfun.club (site/lib/content.ts).
-- TODO(FinFun): prices, topics and rubric wording still need confirming (see the site's TODO(FinFun) notes).

insert into public.programs (slug, name, grade_min, grade_max, price_paise, description, sticker) values
  ('basic', 'FinFun Basic', 3, 5, 99900, 'Coins and notes, needs vs wants, saving in a gullak, earning and sharing.', '/a/sticker/04-dadis-gullak.webp'),
  ('pro', 'FinFun Pro', 6, 7, 149900, 'Needs vs wants, budgeting, saving goals, UPI and scam safety.', '/a/sticker/06-need-or-want.webp'),
  ('advantage', 'FinFun Advantage', 8, 10, 249900, 'Banking, SIPs and compounding, inflation, investing basics, side hustles.', '/a/sticker/03-the-investor.webp');

insert into public.modules (program_id, position, title)
select p.id, t.position, t.title
from public.programs p
join (values
  ('basic', 1, 'Know your money'), ('basic', 2, 'Needs vs wants'), ('basic', 3, 'Save in a gullak'),
  ('basic', 4, 'Set a goal'), ('basic', 5, 'Earn it'), ('basic', 6, 'Share and give'),
  ('pro', 1, 'Needs vs wants'), ('pro', 2, 'Budgeting'), ('pro', 3, 'Saving goals'),
  ('pro', 4, 'UPI and scan safety'), ('pro', 5, 'Scam safety'), ('pro', 6, 'Sale is not saving'),
  ('advantage', 1, 'My first bank account'), ('advantage', 2, 'SIPs and compounding'), ('advantage', 3, 'Inflation is real'),
  ('advantage', 4, 'Investing basics'), ('advantage', 5, 'Side hustles'), ('advantage', 6, 'Avoid the EMI trap')
) as t(slug, position, title) on t.slug = p.slug;

insert into public.rubric_skills (id, name) values
  (1, 'Money basics'), (2, 'Saving & goals'), (3, 'Smart spending'), (4, 'Staying safe');

insert into public.rubric_levels (level, name, label) values
  (1, 'Bronze', 'Getting started'), (2, 'Silver', 'Getting there'), (3, 'Gold', 'Money champ');

insert into public.badges (slug, name, image, rule) values
  ('first-class', 'First class', '/a/gamification/badge-money-smart.webp', '{"attended_sessions": 1}'),
  ('super-saver', 'Super Saver', '/a/gamification/badge-super-saver.webp', '{"module_done": "Saving goals"}'),
  ('budget-boss', 'Budget Boss', '/a/gamification/badge-budget-boss.webp', '{"module_done": "Budgeting"}');
