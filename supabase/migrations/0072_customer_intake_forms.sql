-- Kom igång-formulär för fysiska klinikkunder (telefonbaserad identitet,
-- precis som journalen) — skilt från coaching_intake (migration 0047), som
-- är för inloggade Premium Coaching-prenumeranter. token ger kunden en
-- egen länk att fylla i formuläret på, utan inloggning, precis som
-- /p/[token] för delade kundprogram.
create table public.customer_intake_forms (
  id uuid primary key default gen_random_uuid(),
  customer_phone text not null unique,
  customer_name text,
  token uuid not null default gen_random_uuid() unique,
  height_cm int,
  weight_kg int,
  symptoms text,
  pain_level int,
  previous_injuries text,
  medications text,
  sedentary_work text,
  sleep_habits text,
  current_training text,
  equipment_access text,
  session_length text,
  goals text,
  other_info text,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.customer_intake_forms enable row level security;
-- Ingen klientpolicy — precis som customer_journal_entries/coaching_journal_entries
-- sker all läsning/skrivning via service_role-klienten (admin-sidan och
-- /f/[token]-formulärets server actions), inte via anon-nyckeln.
