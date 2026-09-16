-- Tillåter att en kundprogram-rad antingen pekar på en övning i det delade
-- övningsbiblioteket (exercise_id) ELLER är en fristående, engångsskapad
-- övning (custom_title/custom_video_url) som coachen skrivit in direkt i
-- programbyggaren, utan att den behöver läggas till i det delade biblioteket.

alter table public.clinic_program_exercises
  drop constraint clinic_program_exercises_pkey;

alter table public.clinic_program_exercises
  add column id uuid not null default gen_random_uuid(),
  add column custom_title text,
  add column custom_video_url text;

alter table public.clinic_program_exercises
  add primary key (id);

alter table public.clinic_program_exercises
  alter column exercise_id drop not null;

alter table public.clinic_program_exercises
  add constraint clinic_program_exercises_exercise_or_custom check (
    (exercise_id is not null and custom_title is null)
    or (exercise_id is null and custom_title is not null)
  );

-- Samma övning fick tidigare bara förekomma en gång per program (den gamla
-- primärnyckeln var clinic_program_id+exercise_id) — bevarar den regeln för
-- biblioteks-övningar. Egna övningar har ingen naturlig dubblettnyckel och
-- får förekomma flera gånger.
create unique index clinic_program_exercises_unique_exercise
  on public.clinic_program_exercises (clinic_program_id, exercise_id)
  where exercise_id is not null;
