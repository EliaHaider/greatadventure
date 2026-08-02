# Great Adventure — Supabase Setup Guide

This is the companion file `admin.html` refers to. It explains how the
Supabase backend behind the admin panel, the offer banner, the reviews
system and the enquiry form is put together, so you (or anyone helping
you later) can rebuild or fix it without guessing.

Your `admin.html` is **already connected** to a live Supabase project
(URL and anon key are hardcoded near the bottom of the file, in the
`<script>` block). You only need this guide if:
- you're setting up a **new/different** Supabase project, or
- a table is missing or broken and you need to recreate it, or
- you want to double-check the permission (RLS) rules are correct.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once created, go to **Project Settings → API** and copy:
   - **Project URL** → this is `SUPABASE_URL`
   - **anon public key** → this is `SUPABASE_ANON_KEY`
3. Paste both into `admin.html` (search for `SUPABASE_URL` near the
   bottom of the file) **and** into `js/main.js` (search for the same
   variable near the top) — both files need the same two values.

---

## 2. Create an admin login

The admin panel uses Supabase's built-in email/password auth — it is
**not** a separate custom login system.

1. In Supabase: **Authentication → Users → Add user**.
2. Enter the email and password you want to log into `admin.html` with.
3. That's it — no extra table needed for login itself.

---

## 3. Create the database tables

Go to **SQL Editor** in Supabase and run the following:

```sql
-- 1) Offer banner (a single row, id = 1, that the homepage banner reads)
create table announcements (
  id integer primary key,
  active boolean default false,
  title text,
  message text,
  updated_at timestamptz default now()
);

insert into announcements (id, active, title, message)
values (1, false, '', '');

-- 2) Visitor-submitted reviews (shown on the homepage once approved)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  rating integer not null check (rating between 1 and 5),
  message text not null,
  approved boolean default false,
  created_at timestamptz default now()
);

-- 3) Enquiries submitted through the "Send enquiry" contact form
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  tour text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);
```

---

## 4. Turn on Row Level Security (RLS) and add policies

Without these policies, either nobody can read/write anything, or
everybody can — including editing your offer banner. Run this after
the tables above:

```sql
alter table announcements enable row level security;
alter table reviews enable row level security;
alter table inquiries enable row level security;

-- Announcements: anyone can read (so the banner shows on the site),
-- only logged-in admins can change it
create policy "Public can read announcements"
  on announcements for select
  using (true);

create policy "Only admins can update announcements"
  on announcements for update
  using (auth.role() = 'authenticated');

-- Reviews: anyone can submit a review, anyone can read APPROVED ones,
-- only logged-in admins can see pending ones / approve / delete
create policy "Public can submit a review"
  on reviews for insert
  with check (true);

create policy "Public can read approved reviews"
  on reviews for select
  using (approved = true);

create policy "Admins can read all reviews"
  on reviews for select
  using (auth.role() = 'authenticated');

create policy "Admins can update reviews"
  on reviews for update
  using (auth.role() = 'authenticated');

create policy "Admins can delete reviews"
  on reviews for delete
  using (auth.role() = 'authenticated');

-- Inquiries: anyone can submit one, only logged-in admins can read/manage them
create policy "Public can submit an inquiry"
  on inquiries for insert
  with check (true);

create policy "Admins can read inquiries"
  on inquiries for select
  using (auth.role() = 'authenticated');

create policy "Admins can update inquiries"
  on inquiries for update
  using (auth.role() = 'authenticated');

create policy "Admins can delete inquiries"
  on inquiries for delete
  using (auth.role() = 'authenticated');
```

---

## 5. What each part of `admin.html` does

| Section on the page | Reads/writes table | Notes |
|---|---|---|
| Manage current offer | `announcements` (id = 1) | Toggle + title + message shown as the site-wide banner |
| Pending reviews / Live reviews | `reviews` | Approve moves a review from pending → live; Delete removes it permanently |
| Customer enquiries | `inquiries` | Filled by the "Send enquiry" form on the homepage; Mark as contacted / Delete |

---

## 7. Email notifications for new reviews & enquiries

By default, Supabase does nothing on its own when a new row is
inserted — you have to explicitly tell it to notify someone. Here are
two ways to make a new review or enquiry email you at
**elia@greatadv.com** automatically. Pick whichever you're comfortable
with; you only need one.

### Option A — Edge Function + Resend (free, instant, no third-party subscription)

This repo includes a ready-made function at
`supabase/functions/notify-new-submission/index.ts`. It emails
elia@greatadv.com whenever a row is inserted into `reviews` or
`inquiries`.

**One-time setup:**
1. Create a free account at [resend.com](https://resend.com) (100
   emails/day free, no credit card needed).
2. In Resend, get an **API key** (Dashboard → API Keys → Create).
3. *(Optional but recommended)* Verify your own domain in Resend
   (Dashboard → Domains → Add greatadv.com, then add the DNS records
   they give you). Until you do this, you can still send using
   Resend's shared `onboarding@resend.dev` sender address for testing
   — just change `FROM_EMAIL` in the function to that instead.
4. Install the Supabase CLI if you don't have it:
   `npm install -g supabase`
5. From this project's folder, log in and link your project:
   ```
   supabase login
   supabase link --project-ref your-project-ref
   ```
   (Your project ref is the random string in your Supabase URL, e.g.
   `jyotzntfainfpgxbolum`.)
6. Set the Resend key as a secret (never put API keys directly in the
   function code):
   ```
   supabase secrets set RESEND_API_KEY=your_resend_api_key_here
   ```
7. Deploy the function:
   ```
   supabase functions deploy notify-new-submission
   ```
8. In the Supabase Dashboard: **Database → Webhooks → Create a new
   webhook**
   - Name: `notify-new-review`
   - Table: `reviews`
   - Events: `Insert`
   - Type: `Supabase Edge Functions`
   - Function: `notify-new-submission`
9. Repeat step 8 for the `inquiries` table (name it
   `notify-new-inquiry`, same function).

That's it — new reviews and enquiries will now land in
elia@greatadv.com within a few seconds of being submitted.

### Option B — Zapier (no code at all)

If you'd rather not touch the CLI or Edge Functions:
1. Create a free [Zapier](https://zapier.com) account.
2. New Zap → Trigger: **Webhooks by Zapier → Catch Hook**. Copy the
   webhook URL Zapier gives you.
3. In Supabase: **Database → Webhooks → Create a new webhook**
   - Table: `reviews`, Events: `Insert`
   - Type: `HTTP Request`
   - URL: paste the Zapier webhook URL from step 2
4. Back in Zapier, set the Zap's action to **Email by Zapier** (or
   Gmail, if you connect elia@greatadv.com's inbox) → send to
   elia@greatadv.com with the row's fields (name, message, etc.)
   inserted into the email body.
5. Repeat for the `inquiries` table with a second Zap.

Zapier's free plan checks for new events every ~15 minutes on some
trigger types, but Catch Hook (used above) fires instantly since
Supabase pushes to it directly.

---

## 8. Quick troubleshooting

- **"Setup needed" message on admin.html** → `SUPABASE_URL` still says
  `PASTE_...` — you haven't added your real project URL/key yet.
- **Login fails** → check you created the user under Authentication →
  Users (not just any email you type).
- **"Could not load enquiries"** → the `inquiries` table doesn't exist
  yet, or RLS policies above haven't been applied.
- **Reviews/banner not showing on the live site** → check the "Public
  can read..." policies above exist; without them the anon key used by
  `main.js` can't read anything.
