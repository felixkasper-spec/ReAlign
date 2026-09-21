-- Stöd för varannan-vecka-scheman, t.ex. en coach som bara jobbar
-- mån-tor jämna veckor, eller är ledig varannan fredag. Använder samma
-- jämn/udda-veckonummer-konvention (ISO 8601) som redan är standard i
-- svenska kalendrar och scheman, så inget nytt begrepp behöver läras in.
-- default 'alla' betyder att blocket gäller varje vecka, som idag.
alter table public.booking_weekly_availability
  add column week_parity text not null default 'alla'
  check (week_parity in ('alla', 'jamn', 'udda'));
