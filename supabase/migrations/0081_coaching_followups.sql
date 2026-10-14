-- Manuell uppföljningspåminnelse — coachen svarar en kund och vill bli
-- påmind om att höra av sig igen om ett valfritt antal dagar, med en egen
-- anteckning om vad som ska följas upp. Skiljer sig från coaching_checkins
-- (automatisk varannan-veckan-kadens för ALLA Premium Coaching-kunder) genom
-- att vara ad-hoc, per-tillfälle och valbar längd — satt av coachen själv i
-- chatten, inte en schemalagd bakgrundsprocess.
create table public.coaching_followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  note text,
  remind_at timestamptz not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Digest-frågan ("vilka är förfallna?") filtrerar alltid på completed_at is
-- null — ett partiellt index håller den frågan snabb utan att indexera
-- färdigbockade rader som aldrig frågas efter igen.
create index coaching_followups_due_idx on public.coaching_followups (remind_at) where completed_at is null;

alter table public.coaching_followups enable row level security;
-- Ingen klientpolicy — samma mönster som coaching_checkins, bara
-- service-role-klienten (admin-sidan) kommer åt raderna.
