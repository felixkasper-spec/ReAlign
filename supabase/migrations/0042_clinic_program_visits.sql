-- Enkel besöksräknare för kundprogram-länkarna: hur många gånger och när
-- senast någon öppnat /p/<token> — så coachen kan se vilka klienter som
-- faktiskt använder sitt program.
alter table public.clinic_programs
  add column visit_count integer not null default 0,
  add column last_visited_at timestamptz;
