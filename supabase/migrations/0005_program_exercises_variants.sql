-- Stödjer programvarianter (Fullt/Mellan/Kort för Helkropp-nivåerna) och
-- uppvärmningsmarkering (gymprogrammen) i program_exercises.
alter table public.program_exercises
  add column variant text not null default 'full',
  add column is_warmup boolean not null default false;

alter table public.program_exercises drop constraint program_exercises_pkey;
alter table public.program_exercises
  add primary key (program_id, exercise_id, variant);

alter table public.programs add column hero_image text;
