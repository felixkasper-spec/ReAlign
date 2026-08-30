-- Programbilder för de två nya Rörlighet-programmen (återanvänder redan
-- existerande övningsbilder i public/exercises/) samt en ompositionering
-- inom Rörlighet axlar/skulderblad/nacke.

update public.programs
set hero_image = '/exercises/spidey-crawls.jpg'
where slug = 'rorlighet-hofter-landrygg';

update public.programs
set hero_image = '/exercises/standing-wall-clock.jpg'
where slug = 'rorlighet-axlar-skulderblad-nacke';

-- Helkropp Nivå 2: Cats and Dogs skulle till sist, men fanns redan i
-- programmet sen tidigare på en annan plats — migration 0012:s insert var
-- därför en no-op (skyddad mot dubbletter) och flyttade den aldrig. Flytta
-- den befintliga raden sist istället för att försöka lägga till en ny.
update public.program_exercises
set order_index = (
  select coalesce(max(pe2.order_index), -1) + 1
  from public.program_exercises pe2
  where pe2.program_id = program_exercises.program_id
    and pe2.variant = program_exercises.variant
    and pe2.exercise_id <> (select id from public.exercises where slug = 'cats-and-dogs')
)
where program_id = (select id from public.programs where slug = 'helkropp-niva-2')
  and variant = 'full'
  and exercise_id = (select id from public.exercises where slug = 'cats-and-dogs');

-- Byt plats på Standing Wall Clock och Standing Shoulder Shrugs i Rörlighet
-- axlar/skulderblad/nacke (fullt program).
update public.program_exercises
set order_index = case
  when exercise_id = (select id from public.exercises where slug = 'standing-wall-clock')
    then (select order_index from public.program_exercises
          where program_id = (select id from public.programs where slug = 'rorlighet-axlar-skulderblad-nacke')
            and variant = 'full'
            and exercise_id = (select id from public.exercises where slug = 'standing-shoulder-shrugs'))
  when exercise_id = (select id from public.exercises where slug = 'standing-shoulder-shrugs')
    then (select order_index from public.program_exercises
          where program_id = (select id from public.programs where slug = 'rorlighet-axlar-skulderblad-nacke')
            and variant = 'full'
            and exercise_id = (select id from public.exercises where slug = 'standing-wall-clock'))
end
where program_id = (select id from public.programs where slug = 'rorlighet-axlar-skulderblad-nacke')
  and variant = 'full'
  and exercise_id in (
    (select id from public.exercises where slug = 'standing-wall-clock'),
    (select id from public.exercises where slug = 'standing-shoulder-shrugs')
  );
