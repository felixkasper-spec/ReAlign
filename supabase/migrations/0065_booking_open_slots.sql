-- Ad-hoc öppnade enstaka tider — komplement till (och på sikt ersättare
-- för) booking_weekly_availability. Coacherna kommer mest öppna enskilda
-- lediga tider här och där istället för att förlita sig på ett
-- återkommande veckoschema, så en bokningsbar tid är nu: (veckoschemat
-- ELLER en rad här) OCH INTE blockerad/redan bokad.
--
-- Varje rad är alltid exakt en halvtimmes-cell i kalenderrutnätet (samma
-- atomära enhet som SLOT_MINUTES i CalendarGrid.tsx) — aldrig en
-- sammanslagen längre period. Det gör "stäng"-togglingen entydig: ta bort
-- exakt den raden, ingen delning/sammanslagning av intervaller behövs.
create table public.booking_open_slots (
  id uuid primary key default gen_random_uuid(),
  staff text not null check (staff in ('felix', 'christopher')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create unique index booking_open_slots_unique_idx
  on public.booking_open_slots (staff, start_at, end_at);

create index booking_open_slots_staff_time_idx
  on public.booking_open_slots (staff, start_at, end_at);

alter table public.booking_open_slots enable row level security;

-- Samma unika-index på booking_blocked_slots så "stäng en tillgänglig
-- veckoschema-tid"-togglingen kan göra en ren upsert (en rad per
-- exakt halvtimme) utan att riskera dubbletter.
create unique index booking_blocked_slots_unique_idx
  on public.booking_blocked_slots (staff, start_at, end_at);
