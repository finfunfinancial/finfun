-- One enquiry inbox for every website form: contact, free demo class, teacher training, NGO / CSR /
-- government partnerships and FinFun Fest contests. All land in Admin → Contact requests.

alter table public.contact_requests drop constraint contact_requests_topic_check;
alter table public.contact_requests add constraint contact_requests_topic_check
  check (topic in ('parent', 'school', 'partnership', 'other', 'trial', 'teacher', 'ngo', 'government', 'contest'));

alter table public.contact_requests
  add column child_grade smallint check (child_grade between 3 and 10),  -- free demo class: which grade
  add column organisation text check (length(organisation) <= 200),      -- school, NGO, company or department
  add column preferred_time text check (length(preferred_time) <= 100);  -- free demo class: when suits them
