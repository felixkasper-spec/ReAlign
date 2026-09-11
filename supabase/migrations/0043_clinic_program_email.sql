-- Kommer ihåg senaste mejladressen ett kundprogram skickats till direkt
-- från coach-sidan, så det syns vem länken gick till utan att behöva
-- leta i mejlhistoriken.
alter table public.clinic_programs
  add column sent_to_email text,
  add column sent_at timestamptz;
