-- Kontaktformuläret skickade tidigare bara en mailto:-länk client-side,
-- vilket tappade meddelandet helt om besökaren saknade ett konfigurerat
-- mejlprogram. Sparas nu i databasen istället — synligt för coachen i
-- admin-inkorgen.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Ingen publik select/update-policy — bara service-role (admin-klienten)
-- får läsa dessa, samma mönster som coaching_messages. Insert måste dock
-- vara öppet för anonyma besökare (formuläret kräver inte inloggning).
create policy "Vem som helst kan skicka ett kontaktmeddelande"
  on public.contact_messages for insert
  with check (true);
