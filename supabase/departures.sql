-- Great Adventure: group departures table
-- Run ONCE in Supabase > SQL Editor. Do NOT upload this file to your website server.

create table if not exists public.departures (
  id          bigint generated always as identity primary key,
  tour        text    not null,                    -- must match a tour name in the enquiry form, e.g. 'K2 Base Camp & Concordia'
  start_date  date    not null,
  end_date    date,                                -- optional
  price_usd   integer,                             -- optional, per person
  spots_left  integer,                             -- optional (leave empty if you do not want to show a number)
  status      text    not null default 'open' check (status in ('open','few','full')),
  note        text,                                -- optional, e.g. 'Confirms once 4 travellers have joined'
  active      boolean not null default true,       -- untick to hide a date without deleting it
  created_at  timestamptz not null default now()
);

alter table public.departures enable row level security;

-- Visitors (anon key) may only READ active rows. Only you, from the Supabase dashboard, can add/edit them.
drop policy if exists "Public can read active departures" on public.departures;
create policy "Public can read active departures"
  on public.departures for select to anon
  using (active = true);

-- HOW TO ADD A DATE: Supabase > Table Editor > departures > Insert row.
-- Only add dates you really intend to run. Example (do not run unless real):
-- insert into public.departures (tour, start_date, end_date, price_usd, note)
-- values ('K2 Base Camp & Concordia', '2027-07-05', '2027-07-24', 2110, 'Confirms once 4 travellers have joined');
