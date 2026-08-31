-- Batch: fyra nya program — Knäfokus (Mjukt/Avancerad) och Väcka sätet
-- (Mjukt/Avancerat) — samt fulla och korta varianter för var och en.
--
-- Skrivet relationellt via slugs, precis som tidigare batchar. Insert-
-- satserna är idempotenta (on conflict do nothing) så filen kan köras om
-- utan att skapa dubbletter. Alla övningsslugs nedan är verifierade mot
-- 0002_seed_exercises.sql.

-- 1) NYA PROGRAM ------------------------------------------------------------
insert into public.programs (slug, title, category, tier, level, description) values
  (
    'knafokus-mjukt',
    'Knäfokus - Mjukt',
    'kna',
    'premium',
    1,
    'Ett mjukare program inriktat på knäproblematik eller brist på funktion, stabilitet eller styrka i knäna. Kombineras med relevanta posturala övningar för bästa möjliga resultat. Fokus kommer även vara på att underlätta för kroppen att ha rakare fotposition, då detta är avgörande för nöjda knän.'
  ),
  (
    'knafokus-avancerad',
    'Knäfokus - Avancerad',
    'kna',
    'premium',
    2,
    'Ett mer utmanande program för dig som inriktat på knäproblematik eller brist på funktion, stabilitet eller styrka i knäna. Kombineras med relevanta posturala övningar för bästa möjliga resultat. VIKTIGT: Du väljer hur djupt du går i varje övning. Sträva efter en fin balans mellan att utmana dig själv men att du ändå känner att du har kontroll på tekniken. Känner du ett obehag i knäna ska du antingen göra övningen med kortare rörelseomfång eller hoppa över övningen.'
  ),
  (
    'vacka-satet-mjukt',
    'Väcka sätet - Mjukt',
    'sate',
    'premium',
    1,
    'Många har svårt att få tydlig kontakt med sätet i vardag och träning, detta sätter mycket belastning på framför allt ländrygg och baksida lår. Känner du dig träffad kan det vara en bra idé att göra detta program. Lägg fokus på att verkligen leta efter aktivering och arbete i just sätet under alla övningar som siktar in sig på sätet. Kombineras med relevanta posturala övningar för bästa möjliga resultat.'
  ),
  (
    'vacka-satet-avancerat',
    'Väcka sätet - Avancerat',
    'sate',
    'premium',
    2,
    'Många har svårt att få tydlig kontakt med sätet i vardag och träning, detta sätter mycket belastning på framför allt ländrygg och baksida lår. Känner du dig träffad kan det vara en bra idé att göra detta program. Lägg fokus på att verkligen leta efter aktivering och arbete i just sätet under alla övningar som siktar in sig på sätet. Kombineras med relevanta posturala övningar för bästa möjliga resultat.'
  )
on conflict (slug) do nothing;

-- 2) KNÄFOKUS - MJUKT ---------------------------------------------------------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('runners-stretch', 0),
  ('spidey-crawls', 1),
  ('inner-thigh-lifts', 2),
  ('hooklying-single-hip-lifts', 3),
  ('bridge-single-leg', 4),
  ('standups', 5),
  ('step-ups-langsam', 6),
  ('romanian-deadlift-single-leg', 7)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'knafokus-mjukt'
on conflict (program_id, exercise_id, variant) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('spidey-crawls', 0),
  ('inner-thigh-lifts', 1),
  ('standups', 2),
  ('romanian-deadlift-single-leg', 3)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'knafokus-mjukt'
on conflict (program_id, exercise_id, variant) do nothing;

-- 3) KNÄFOKUS - AVANCERAD -----------------------------------------------------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('inner-thigh-lifts', 0),
  ('pelvic-rolls-wall', 1),
  ('squatting-at-door', 2),
  ('squatting-overhead', 3),
  ('bench-step-ups', 4),
  ('lateral-lunges-wall', 5),
  ('lunges-forward', 6)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'knafokus-avancerad'
on conflict (program_id, exercise_id, variant) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('pelvic-rolls-wall', 0),
  ('squatting-at-door', 1),
  ('lateral-lunges-wall', 2),
  ('lunges-forward', 3)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'knafokus-avancerad'
on conflict (program_id, exercise_id, variant) do nothing;

-- 4) VÄCKA SÄTET - MJUKT -------------------------------------------------------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('runners-stretch', 0),
  ('hooklying-single-hip-lifts', 1),
  ('active-cobra', 2),
  ('bridges-wide', 3),
  ('bridge-single-leg', 4),
  ('standups', 5),
  ('sitting-one-leg-hip-stretch', 6)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'vacka-satet-mjukt'
on conflict (program_id, exercise_id, variant) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('hooklying-single-hip-lifts', 0),
  ('active-cobra', 1),
  ('bridges-wide', 2),
  ('standups', 3)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'vacka-satet-mjukt'
on conflict (program_id, exercise_id, variant) do nothing;

-- 5) VÄCKA SÄTET - AVANCERAT ----------------------------------------------------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('sitting-single-hip-lifts', 0),
  ('bridge-single-leg', 1),
  ('hand-leg-opposite-lifts-on-hands-and-knees', 2),
  ('squatting-at-door', 3),
  ('postural-squats', 4),
  ('romanian-deadlift', 5),
  ('romanian-deadlift-single-leg', 6)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'vacka-satet-avancerat'
on conflict (program_id, exercise_id, variant) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('sitting-single-hip-lifts', 0),
  ('squatting-at-door', 1),
  ('postural-squats', 2),
  ('romanian-deadlift', 3)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'vacka-satet-avancerat'
on conflict (program_id, exercise_id, variant) do nothing;
