-- Contact form on finfun.club/contact. Anyone can send a message; only admins can read and follow up.

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  email text not null check (length(email) <= 200 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text check (length(phone) <= 20),
  topic text not null default 'parent' check (topic in ('parent', 'school', 'partnership', 'other')),
  message text not null check (length(trim(message)) between 1 and 2000),
  status text not null default 'new' check (status in ('new', 'contacted')),
  note text check (length(note) <= 1000), -- admin's follow-up note
  created_at timestamptz not null default now(),
  contacted_at timestamptz,
  contacted_by uuid references public.profiles on delete set null
);
create index on public.contact_requests (status, created_at desc);

alter table public.contact_requests enable row level security;
create policy admin_all on public.contact_requests for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
-- Visitors (logged in or not) may only send a fresh message; they can never read any back.
create policy anyone_sends on public.contact_requests for insert to anon, authenticated
  with check (status = 'new' and note is null and contacted_at is null and contacted_by is null);
