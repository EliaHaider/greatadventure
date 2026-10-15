# Great Adventure — Admin Panel Setup Guide

Ye guide follow karein taake sirf aapke paas offer-banner, reviews, aur customer enquiries manage karne ka access ho.

## ✅ Supabase already connected hai
Project URL aur **anon public key** already `js/main.js` aur `admin.html` mein daal diye gaye hain — Step 4-5 skip kar sakte hain. Aapko sirf **Step 2, 2b, aur 2c** ke SQL commands apne Supabase project mein run karne hain (agar pehle nahi kiye), aur **Step 3** mein apna admin login banana hai.

## ⚠️ service_role key kabhi website files mein na daalein
Supabase har project ke sath do keys deta hai: **anon public key** (safe, website mein use hoti hai) aur **service_role secret key** (poori database tak full access deti hai, bina kisi restriction ke). service_role key sirf Supabase dashboard tak mehdood rakhein — kabhi bhi kisi HTML/JS file mein na daalein, warna koi bhi jo aapki website ka source code dekhega, poori database access kar sakta hai. Great Adventure ki files mein sirf anon key use hoti hai — ye jaan-boojh kar kiya gaya hai.

## Step 1 — Supabase account (already done)
Project ban chuka hai, URL/key connected hain.

## Step 2 — Announcements table (offer banner ke liye)
Agar pehle se nahi bana hai, Supabase SQL Editor mein ye run karein:

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

## Step 2b — Reviews table (visitors ke reviews ke liye)

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

create policy "Public can read approved reviews" on reviews
  for select using (approved = true);
create policy "Public can submit reviews" on reviews
  for insert with check (approved = false);
create policy "Only admin can manage reviews" on reviews
  for all using (auth.role() = 'authenticated');
```

Is se ye guarantee hoti hai: **koi bhi visitor review likh sakta hai, lekin sirf aap (admin login se) usko approve karne ke baad hi wo website pe dikhega.** Homepage sirf latest 9 approved reviews dikhati hai — is se site hamesha halki/fast rehti hai chahe kitne bhi reviews aa jayein.

## Step 2c — Inquiries table (contact form ke messages ke liye)
Website ke "Send enquiry" form ko is table ki zaroorat hai — bina is ke form submit fail ho jayega:

```sql
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  tour text,
  message text,
  status text not null default 'new',
  created_at timestamptz default now()
);
alter table inquiries enable row level security;

-- Koi bhi visitor enquiry submit kar sake
create policy "Public can submit inquiries" on inquiries
  for insert with check (true);

-- Sirf aap (admin login) enquiries dekh/manage kar sakein — koi aur visitor doosron ki enquiries nahi dekh sakta
create policy "Only admin can view inquiries" on inquiries
  for select using (auth.role() = 'authenticated');
create policy "Only admin can manage inquiries" on inquiries
  for update using (auth.role() = 'authenticated');
create policy "Only admin can delete inquiries" on inquiries
  for delete using (auth.role() = 'authenticated');
```

Ab jab koi tourist contact form bharega, uska message seedha **admin panel ke "Customer enquiries" section** mein aayega — email ya WhatsApp check karne ki zaroorat nahi, sab ek jagah milega.

## Step 2d — Departures table (Fixed Departures / group joining ke liye)
Website ke "Confirmed Departure Dates" table ko is table ki zaroorat hai:

```sql
create table departures (
  id uuid primary key default gen_random_uuid(),
  trek_name text not null,
  start_date date not null,
  end_date date not null,
  price int,
  slots_left int,
  status text not null default 'available',
  active boolean not null default true,
  created_at timestamptz default now()
);
alter table departures enable row level security;

create policy "Public can read active departures" on departures
  for select using (active = true);
create policy "Only admin can manage departures" on departures
  for all using (auth.role() = 'authenticated');
```

Ab admin panel ke "Fixed departures" section se aap real departure dates add kar sakte hain (naam, dates, price, kitne slots baaki hain, status Guaranteed/Available). Website khud-ba-khud ye table dikhayegi — solo travellers ise dekh kar kisi group mein join karne ka faisla kar sakte hain. Jab tak koi departure add na karein, website pe "No confirmed departures listed right now" dikhega — koi fake/galat date kabhi nahi dikhegi.

## Step 3 — Apna admin login banayein
Supabase dashboard → Authentication → Users → Add user (email/password) — ye credentials sirf aapke paas rahenge, admin.html isi se login hota hai.

## Step 6 — Test karein
1. `admin.html` khol kar login karein
2. Offer banner likh ke save karein, `index.html` khol kar check karein
3. Website ke contact form se ek test enquiry bhejein, phir admin panel ke "Customer enquiries" section mein refresh karke check karein ke wo aa gayi
4. "Fixed departures" section mein ek test departure add karein, `index.html` khol kar check karein ke "Confirmed departure dates" table mein dikh raha hai

## Security tips
- `admin.html` ka link kahin public na karein (site ke menu mein na daalein)
- Supabase login credentials aur service_role key kisi ke sath share na karein
- Domain aur hosting ka login bhi sirf aapke paas rahe

