-- Intresseanmälningar från lead-sidan (/coaching-anmalan) för Premium
-- Coaching — besökaren lämnar sina uppgifter, coachen ringer själv upp.
-- Samma mönster som contact_messages: öppen insert-policy (besökaren är
-- inte inloggad), ingen publik select/update — bara service-role
-- (admin-klienten) läser och markerar leads som kontaktade.
create table public.coaching_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  situation text,
  contacted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.coaching_leads enable row level security;

create policy "Vem som helst kan lämna en intresseanmälan"
  on public.coaching_leads for insert
  with check (true);
