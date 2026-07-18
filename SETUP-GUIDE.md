# Great Adventure — Admin Panel Setup Guide

Ye guide follow karein taake sirf aapke paas offer-banner edit karne ka access ho. Ek dafa setup ho jaye, uske baad har change 2 minute ka kaam hai.

## Step 1 — Free Supabase account banayein
1. https://supabase.com par jayein → "Start your project" → apne email se signup karein
2. Naya project banayein (naam: `great-adventure`), koi bhi strong database password set karein aur **save kar lein**
3. Project ban jane ke baad (1-2 minute lagte hain), left sidebar mein **SQL Editor** par click karein

## Step 2 — Table banayein
SQL Editor mein ye paste karke **Run** karein:

```sql
create table announcements (
  id int8 primary key,
  active boolean default false,
  title text,
  message text,
  updated_at timestamptz default now()
);

insert into announcements (id, active, title, message)
values (1, false, '', '');

alter table announcements enable row level security;

create policy "Public can read" on announcements
  for select using (true);

create policy "Only logged in admin can update" on announcements
  for all using (auth.role() = 'authenticated');
```

Ye ensure karta hai: **koi bhi visitor sirf dekh sakta hai, sirf login kiya hua admin (yani aap) change kar sakta hai.**

## Step 3 — Apna admin login banayein
1. Left sidebar mein **Authentication → Users** par jayein
2. **Add user** par click karein
3. Apna email aur ek strong password daal ke save karein — **ye credentials sirf aapke paas honge**, kisi ko na dein

## Step 4 — API keys copy karein
1. Left sidebar mein **Project Settings → API** par jayein
2. **Project URL** copy karein
3. **anon public key** copy karein (ye public/safe hai, security row-level-policy se hoti hai, upar wale step mein set ki)

## Step 5 — Dono files mein paste karein
`index.html` aur `admin.html` — dono files mein ye lines dhoondhein:

```
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

Inki jagah apna asal URL aur anon key paste kar dein. Dono files mein same values honi chahiye.

## Step 6 — Test karein
1. `admin.html` ko browser mein khol kar apne email/password se login karein
2. Ek test offer likhein, toggle "on" karein, "Save and publish" dabayein
3. `index.html` khol kar dekhein — banner top pe dikhna chahiye

## Important — Security tips
- `admin.html` ka link kahin bhi public na karein (site ke menu mein na daalein) — sirf aap directly URL type karke jayein
- Supabase login credentials aur account password kisi ke sath share na karein
- Domain aur hosting (Netlify/Vercel) ka login bhi sirf aapke paas rahe

Agar kisi step mein atkein, mujhe bata dein — main file dobara check kar dunga.
