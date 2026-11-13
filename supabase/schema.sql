-- RADHE ARENA PREMIUM — SAFE ADDITIVE SCHEMA
-- Run in Supabase SQL Editor.
-- This script creates/extends the booking system without requiring a service-role key in the browser.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  date date not null,
  slot text not null,
  players integer not null default 1 check (players > 0 and players <= 30),
  status text not null default 'Pending' check (status in ('Pending','Approved','Rejected')),
  created_at timestamptz not null default now(),
  booking_type text not null default 'single' check (booking_type in ('single','double')),
  duration_hours integer not null default 1 check (duration_hours in (1,2)),
  start_time time not null,
  end_time time not null,
  total_price integer not null default 0
);

alter table public.bookings add column if not exists booking_type text not null default 'single';
alter table public.bookings add column if not exists duration_hours integer not null default 1;
alter table public.bookings add column if not exists start_time time;
alter table public.bookings add column if not exists end_time time;
alter table public.bookings add column if not exists total_price integer not null default 0;

create table if not exists public.blocked_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_time time not null,
  end_time time not null,
  reason text default 'Blocked by admin',
  created_at timestamptz not null default now(),
  unique(date, start_time)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_start_idx on public.bookings(date, start_time);
create index if not exists blocked_slots_date_start_idx on public.blocked_slots(date, start_time);

-- Normalize old rows that may have a text slot but no canonical start/end.
-- Only handles the common "HH:00 AM/PM - HH:00 AM/PM" format manually through a safe parser.
create or replace function public.parse_slot_start(slot_text text)
returns time
language plpgsql
immutable
as $$
declare
  s text;
  h int;
  m int;
  ap text;
begin
  s := upper(trim(split_part(slot_text, '-', 1)));
  ap := right(s, 2);
  s := trim(left(s, length(s)-2));
  h := split_part(s, ':', 1)::int;
  m := split_part(s, ':', 2)::int;
  if ap = 'AM' then
    if h = 12 then h := 0; end if;
  elsif ap = 'PM' then
    if h <> 12 then h := h + 12; end if;
  end if;
  return make_time(h,m,0);
exception when others then
  return null;
end;
$$;

update public.bookings
set start_time = public.parse_slot_start(slot)
where start_time is null and slot is not null;

update public.bookings
set end_time = start_time + make_interval(hours => greatest(1, duration_hours))::interval
where end_time is null and start_time is not null;

-- Security
alter table public.bookings enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "public booking insert" on public.bookings;
create policy "public booking insert"
on public.bookings for insert
to anon, authenticated
with check (status = 'Pending');

drop policy if exists "public booking no read" on public.bookings;
create policy "public booking no read"
on public.bookings for select
to anon
using (false);

drop policy if exists "admin booking read" on public.bookings;
create policy "admin booking read"
on public.bookings for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admin booking update" on public.bookings;
create policy "admin booking update"
on public.bookings for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admin booking delete" on public.bookings;
create policy "admin booking delete"
on public.bookings for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "public blocked read" on public.blocked_slots;
create policy "public blocked read"
on public.blocked_slots for select
to anon, authenticated
using (true);

drop policy if exists "admin blocked insert" on public.blocked_slots;
create policy "admin blocked insert"
on public.blocked_slots for insert
to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "admin blocked delete" on public.blocked_slots;
create policy "admin blocked delete"
on public.blocked_slots for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Atomic booking RPC. It checks every hour covered by the request.
create or replace function public.create_radhe_booking(
  p_name text,
  p_phone text,
  p_date date,
  p_start_time time,
  p_duration_hours integer,
  p_players integer,
  p_total_price integer,
  p_slot_label text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.bookings;
  i integer;
  current_start time;
  current_end time;
begin
  if p_duration_hours not in (1,2) then
    raise exception 'Invalid duration';
  end if;

  if p_players < 1 or p_players > 30 then
    raise exception 'Invalid player count';
  end if;

  if p_start_time < time '06:00' or p_start_time >= time '23:00' then
    raise exception 'Invalid start time';
  end if;

  for i in 0..(p_duration_hours - 1) loop
    current_start := p_start_time + make_interval(hours => i);
    current_end := current_start + interval '1 hour';

    if exists (
      select 1 from public.blocked_slots b
      where b.date = p_date and b.start_time = current_start
    ) then
      raise exception 'Selected slot is blocked';
    end if;

    if exists (
      select 1 from public.bookings b
      where b.date = p_date
        and b.status in ('Pending','Approved')
        and b.start_time = current_start
    ) then
      raise exception 'Selected slot is already booked';
    end if;
  end loop;

  insert into public.bookings(
    name, phone, date, slot, players, status,
    booking_type, duration_hours, start_time, end_time, total_price
  )
  values (
    trim(p_name), trim(p_phone), p_date, p_slot_label, p_players, 'Pending',
    case when p_duration_hours = 2 then 'double' else 'single' end,
    p_duration_hours, p_start_time,
    p_start_time + make_interval(hours => p_duration_hours),
    p_total_price
  )
  returning * into result;

  return result;
end;
$$;

revoke all on function public.create_radhe_booking(text,text,date,time,integer,integer,integer,text) from public;
grant execute on function public.create_radhe_booking(text,text,date,time,integer,integer,integer,text) to anon, authenticated;

-- IMPORTANT:
-- After creating a Supabase Auth user for the owner/admin, run:
-- insert into public.admin_users(user_id)
-- values ('PASTE_AUTH_USER_UUID_HERE');
