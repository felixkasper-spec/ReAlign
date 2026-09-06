-- Intro-text för Avslappning-programmet.
update public.programs
set description = 'Ett program som hjälper både kropp och sinne varva ner.'
where slug = 'avslappning';

-- Gör Tapping till en Premium-övning.
update public.exercises
set is_premium = true
where slug = 'tapping';
