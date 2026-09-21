-- Egen bokningskalender för adminverktyget — portad från Cleer Klinik-sidan
-- (samma underliggande klinikverksamhet). Fas 1: datamodell + tillgänglighet
-- för admin-kalendern. Publikt bokningsflöde byggs i en senare migration.

-- Tjänstekatalogen — samma utgångsläge som Cleer Klinik-sidan, redigerbar i
-- admin-kalenderns "Tjänster"-panel efteråt.
-- show_duration_to_customer: vissa tjänster ska ha dold längd för kunden
-- (både i bokningsflödet och bekräftelsen), trots att vi internt behöver
-- veta den exakta längden för att boka rätt tidslucka och undvika
-- dubbelbokning.
create table public.booking_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes int not null,
  price_sek int not null default 0,
  show_duration_to_customer boolean not null default true,
  existing_clients_only boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.booking_services
  (name, duration_minutes, price_sek, show_duration_to_customer, existing_clients_only, sort_order)
values
  ('Konsultationssamtal - Postural Träning/behandling', 30, 0, true, false, 1),
  ('Nybesök Postural träning', 60, 795, true, false, 2),
  ('Postural Träning - Videoanalys och program', 40, 590, false, false, 3),
  ('Tränings/behandlingstillfälle', 40, 0, false, true, 4);

-- Återkommande veckoschema per coach. Flera rader per veckodag tillåtna
-- (t.ex. förmiddagspass + eftermiddagspass med lunchlucka emellan).
-- weekday: 1 = måndag ... 7 = söndag (ISO 8601).
create table public.booking_weekly_availability (
  id uuid primary key default gen_random_uuid(),
  staff text not null check (staff in ('felix', 'christopher')),
  weekday int not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

-- Enstaka blockerade perioder (semester, privata ärenden) som bryter mot
-- det återkommande veckoschemat för en specifik coach.
create table public.booking_blocked_slots (
  id uuid primary key default gen_random_uuid(),
  staff text not null check (staff in ('felix', 'christopher')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

-- Faktiska bokningar. Öppen insert-policy (kunden är inte inloggad) —
-- samma mönster som coaching_leads. end_at sparas explicit (uträknat från
-- tjänstens duration_minutes vid bokningstillfället) istället för att alltid
-- härledas från booking_services, så historiska bokningar inte påverkas om
-- en tjänsts längd ändras senare.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.booking_services (id),
  staff text not null check (staff in ('felix', 'christopher')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  notes text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  lead_id uuid references public.coaching_leads (id) on delete set null,
  cancellation_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create unique index bookings_cancellation_token_idx on public.bookings (cancellation_token);

-- Snabb koll av krockande bokningar för en coach vid ett givet tillfälle
-- (det publika bokningsflödet i en senare fas kommer fråga mot detta index).
create index bookings_staff_time_idx on public.bookings (staff, start_at, end_at)
  where status = 'confirmed';

alter table public.booking_services enable row level security;
alter table public.booking_weekly_availability enable row level security;
alter table public.booking_blocked_slots enable row level security;
alter table public.bookings enable row level security;

-- Tjänstekatalogen behöver vara publikt läsbar (kunden ska kunna se vilka
-- tjänster som går att boka, priser och synlig längd, utan att vara
-- inloggad).
create policy "Vem som helst kan se aktiva tjänster"
  on public.booking_services for select
  using (active = true);

-- Bokningar skapas av icke-inloggade kunder, precis som coaching_leads.
create policy "Vem som helst kan skapa en bokning"
  on public.bookings for insert
  with check (true);

-- booking_weekly_availability och booking_blocked_slots har RLS men INGA
-- policyer — bara service-role-klienten (admin-sidan, och det publika
-- bokningsflödets slot-uträkning på servern) läser dem. Ingen anledning
-- att exponera coachernas råa schemarader till klienten; den publika sidan
-- kommer istället få ut färdiguträknade lediga tider via en server action.
