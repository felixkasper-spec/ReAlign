-- Schemaläggning: en rad i logged_sessions kan nu representera antingen
-- ett framtida schemalagt pass (scheduled_for satt, completed_at null)
-- eller ett redan genomfört pass (completed_at satt) — matchar hur
-- prototypens Min sida-dashboard blandar båda i samma lista.

alter table public.logged_sessions
  alter column completed_at drop not null,
  alter column completed_at drop default,
  add column scheduled_for timestamptz;

alter table public.logged_sessions
  add constraint logged_sessions_has_time
  check (scheduled_for is not null or completed_at is not null);
