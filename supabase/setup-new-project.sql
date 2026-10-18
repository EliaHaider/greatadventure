-- ============================================================
-- Great Adventure: poora database naye Supabase project ke liye
-- Supabase > SQL Editor > New query > ye sab paste karein > Run
-- Dobara run karna bhi safe hai.
-- ============================================================

-- 1) Enquiries (contact form)
create table if not exists public.inquiries (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  tour        text,
  message     text,
  status      text not null default 'new',
  phone       text,
  country     text,
  start_date  date,
  end_date    date,
  date_notes  text,
  group_size  text
);

-- 2) Reviews (sirf approved=true website par dikhte hain)
create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null,
  country     text,
  rating      integer check (rating between 1 and 5),
  message     text not null,
  approved    boolean not null default false
);

-- 3) Offer banner (admin panel wali ek row, id = 1)
create table if not exists public.announcements (
  id          integer primary key,
  active      boolean not null default false,
  title       text,
  message     text,
  updated_at  timestamptz default now()
);
insert into public.announcements (id, active, title, message)
values (1, false, '', '') on conflict (id) do nothing;

-- 4) Group departures (admin panel se dates)
create table if not exists public.departures (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  tour        text not null,
  start_date  date not null,
  end_date    date,
  price_usd   integer,
  spots_left  integer,
  status      text not null default 'open' check (status in ('open','few','full')),
  note        text,
  active      boolean not null default true
);

-- ---------- Security (RLS): visitors kya kar sakte hain ----------
alter table public.inquiries     enable row level security;
alter table public.reviews       enable row level security;
alter table public.announcements enable row level security;
alter table public.departures    enable row level security;

-- inquiries: visitor sirf enquiry BHEJ sakta hai, parh nahi sakta. Admin sab kuch.
drop policy if exists "Visitors can send an enquiry" on public.inquiries;
create policy "Visitors can send an enquiry" on public.inquiries
  for insert to anon, authenticated with check (status = 'new');
drop policy if exists "Admin manages enquiries" on public.inquiries;
create policy "Admin manages enquiries" on public.inquiries
  for all to authenticated using (true) with check (true);

-- reviews: visitor review bhej sakta hai (approved=false), sirf approved dekh sakta hai
drop policy if exists "Visitors can submit a review" on public.reviews;
create policy "Visitors can submit a review" on public.reviews
  for insert to anon, authenticated with check (approved = false);
drop policy if exists "Public reads approved reviews" on public.reviews;
create policy "Public reads approved reviews" on public.reviews
  for select to anon using (approved = true);
drop policy if exists "Admin manages reviews" on public.reviews;
create policy "Admin manages reviews" on public.reviews
  for all to authenticated using (true) with check (true);

-- announcements: sab parh sakte hain, sirf admin badal sakta hai
drop policy if exists "Public reads announcements" on public.announcements;
create policy "Public reads announcements" on public.announcements
  for select to anon using (true);
drop policy if exists "Admin manages announcements" on public.announcements;
create policy "Admin manages announcements" on public.announcements
  for all to authenticated using (true) with check (true);

-- departures: sab sirf active dates dekh sakte hain, sirf admin badal sakta hai
drop policy if exists "Public reads active departures" on public.departures;
create policy "Public reads active departures" on public.departures
  for select to anon using (active = true);
drop policy if exists "Admin manages departures" on public.departures;
create policy "Admin manages departures" on public.departures
  for all to authenticated using (true) with check (true);
