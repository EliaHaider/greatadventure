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

## Step 3 — Apna admin login banayein
Authentication → Users → Add user (email/password) — ye credentials sirf aapke paas rahenge.

## Step 4 — API keys copy karein
Project Settings → API se Project URL aur anon public key copy karein.

## Step 5 — Paste karein
`assets/main.js` aur `admin.html` — dono mein ye lines dhoondh kar apni values daalein:
```
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

## Step 6 — Test karein
`admin.html` khol kar login karein, offer likhein, save karein, phir `index.html` khol kar banner check karein.

## Security tips
- `admin.html` ka link kahin public na karein
- Supabase login kisi se share na karein
