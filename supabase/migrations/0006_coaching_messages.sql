-- Chattfunktion för Premium Coaching (449 kr/mån): en asynkron trådad chatt
-- mellan användaren och en coach på kliniken (svar inom 1-2 vardagar, inte
-- realtid). En rad per meddelande, alla meddelanden för en användare delar
-- samma tråd (ingen separat "conversations"-tabell behövs för detta upplägg).
--
-- RLS följer samma mönster som subscriptions: användaren får bara läsa och
-- skriva sina egna rader, och bara som avsändare 'user'. Coach-sidan (svar,
-- läsning av alla trådar) sker via service_role-nyckeln från en gated
-- admin-sida, inte via klient-policyer.

create table public.coaching_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  sender text not null check (sender in ('user', 'coach')),
  body text not null check (char_length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index coaching_messages_user_id_created_at_idx
  on public.coaching_messages (user_id, created_at);

alter table public.coaching_messages enable row level security;

create policy "Användare kan läsa sina egna meddelanden"
  on public.coaching_messages for select
  using (auth.uid() = user_id);

create policy "Användare kan skicka egna meddelanden"
  on public.coaching_messages for insert
  with check (auth.uid() = user_id and sender = 'user');

-- Ingen update/delete-policy för klienter — meddelandehistorik är
-- oföränderlig. Coachens svar skrivs via service_role-nyckeln.
