-- Schema change — run manually in Supabase SQL Editor.
-- Guidance duration (seconds) for the session-player countdown. Nullable
-- and only populated for exercises actually used in a player-mode program
-- so far; the player falls back to a sane default when null.

alter table public.exercises
  add column if not exists duration_seconds integer;
