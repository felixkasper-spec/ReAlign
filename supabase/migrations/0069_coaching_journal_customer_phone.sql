-- Utökar coaching_journal_entries till att även täcka fysiska klinikkunder
-- (identifierade via telefonnummer, som på kundsidan) — inte bara inloggade
-- Premium Coaching-användare. user_id blir nullable och customer_phone
-- läggs till som alternativ identitet; minst en av dem måste finnas.
-- booking_id kopplar en anteckning till en specifik bokning (t.ex. skriven
-- direkt efter ett besök), nullable eftersom de flesta anteckningar inte
-- hör till en specifik bokning.
alter table public.coaching_journal_entries
  alter column user_id drop not null,
  add column customer_phone text,
  add column booking_id uuid references public.bookings (id) on delete set null;

alter table public.coaching_journal_entries
  add constraint coaching_journal_entries_has_identity
  check (user_id is not null or customer_phone is not null);

create index coaching_journal_entries_customer_phone_idx
  on public.coaching_journal_entries (customer_phone, created_at);
