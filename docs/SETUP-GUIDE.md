# Great Adventure — Admin Panel Setup Guide

Ye guide follow karein taake sirf aapke paas offer-banner edit karne ka access ho.

## Step 1 — Free Supabase account banayein
1. https://supabase.com par jayein → "Start your project" → apne email se signup karein
2. Naya project banayein (naam: `great-adventure`), strong database password set karein aur save kar lein

## Step 2 — Table banayein
SQL Editor mein ye paste karke Run karein:

```sql
create table announcements (
  id int8 primary key,
  active boolean default false,
  title text,
  message text,
  updated_at timestamptz default now()
);
insert into announcements (id, active, title, message) values (1, false, '', '');
alter table announcements enable row level security;
create policy "Public can read" on announcements for select using (true);
create policy "Only logged in admin can update" on announcements for all using (auth.role() = 'authenticated');
```

## Step 2b — Reviews table banayein (visitors ke reviews ke liye)
Wahi SQL Editor mein ye bhi paste karke Run karein:

```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  rating int not null check (rating between 1 and 5),
  message text not null,
  approved boolean not null default false,
  created_at timestamptz default now()
);
alter table reviews enable row level security;

-- Sab log sirf APPROVED reviews dekh sakein
create policy "Public can read approved reviews" on reviews
  for select using (approved = true);

-- Koi bhi visitor naya review submit kar sake, lekin khud ko "approved" nahi kar sakta
create policy "Public can submit reviews" on reviews
  for insert with check (approved = false);

-- Sirf aapka admin login review ko approve/delete kar sake
create policy "Only admin can manage reviews" on reviews
  for all using (auth.role() = 'authenticated');
```

Is se ye guarantee hoti hai: **koi bhi visitor review likh sakta hai, lekin sirf aap (admin login se) usko approve karne ke baad hi wo website pe dikhega.** Homepage sirf latest 9 approved reviews dikhati hai — is se site hamesha halki/fast rehti hai chahe kitne bhi reviews aa jayein. Purane reviews delete karne ke liye admin panel mein "Live reviews" list se Delete button use karein.

## Step 3 — Apna admin login banayein
Authentication → Users → Add user (email/password) — ye credentials sirf aapke paas rahenge.

## Step 4 — API keys copy karein
Project Settings → API se Project URL aur anon public key copy karein.

## Step 5 — Paste karein
`js/main.js` aur `admin.html` — dono mein ye lines dhoondh kar apni values daalein:
```
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

## Step 6 — Test karein
`admin.html` khol kar login karein, offer likhein, save karein, phir `index.html` khol kar banner check karein.

## Security tips
- `admin.html` ka link kahin public na karein
- Supabase login kisi se share na karein
