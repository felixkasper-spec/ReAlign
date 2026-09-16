-- Skydda redan skickade kundlänkar mot framtida ändringar i det delade
-- övningsbiblioteket. exercise_id hade "on delete cascade" — om en övning
-- någonsin tas bort ur biblioteket (t.ex. vid en framtida städning) skulle
-- den tyst försvinna ur ALLA kundprogram som råkar använda den, inklusive
-- redan utskickade länkar, och kunde tömma ett program helt (404, samma
-- symptom som förra buggen). "restrict" gör det istället omöjligt att
-- radera en övning som fortfarande ligger i något kundprogram — borttaget
-- måste då göras medvetet (flytta över kunderna till en annan övning
-- först), aldrig som en tyst bieffekt.
alter table public.clinic_program_exercises
  drop constraint clinic_program_exercises_exercise_id_fkey;

alter table public.clinic_program_exercises
  add constraint clinic_program_exercises_exercise_id_fkey
    foreign key (exercise_id) references public.exercises (id) on delete restrict;
