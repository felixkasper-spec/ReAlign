-- Håller koll på när statusen senast ändrades (inte bara när leadet skapades)
-- så uppföljningspåminnelser ("dags för SMS 2") kan räknas från senaste
-- kontaktförsöket istället för från det ursprungliga inskicket.
alter table public.coaching_leads
  add column status_updated_at timestamptz not null default now();
