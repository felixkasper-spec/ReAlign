-- Adds a standalone premium flag on exercises, for exercises that aren't
-- tied to any program (where the derived program_exercises + programs.tier
-- logic in lib/exercise-tier.ts can't determine a tier).

alter table public.exercises
  add column if not exists is_premium boolean not null default false;
