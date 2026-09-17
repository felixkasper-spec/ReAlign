-- Coachen ska kunna lägga in samma övning flera gånger i samma kundprogram
-- (t.ex. som både uppvärmning i början och nedvarvning på slutet) — den
-- gamla unique-regeln (en övning fick bara förekomma en gång per program,
-- från 0053_custom_clinic_program_exercises.sql) tillät inte det och gav
-- ett förvirrande "kunde inte spara"-fel även när användaren aldrig lade in
-- en oavsiktlig dubblett.
drop index if exists public.clinic_program_exercises_unique_exercise;
