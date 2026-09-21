-- Ny funktion, unik för ReAlign (finns inte på Cleer Klinik-sidan): en
-- fysisk klinikkund (identifierad via telefonnummer, som annars är
-- fristående från inloggning — se bookings/client_packages/clinic_programs)
-- kan valfritt kopplas till ett inlogg (profiles-rad), så att coachens
-- chatt-inkorg tydligt visar vilken fysisk kund ett inloggat konto
-- tillhör. En rad per telefonnummer, skapas/uppdateras automatiskt när en
-- kund först dyker upp (bokning, journalanteckning, kundprogram) — se
-- lib/customers.ts. RLS på utan klientpolicyer, samma mönster som övriga
-- admin-bara-tabeller.
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  email text,
  linked_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index customers_linked_user_id_idx
  on public.customers (linked_user_id)
  where linked_user_id is not null;

alter table public.customers enable row level security;
