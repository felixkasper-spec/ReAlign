-- Batch: två nya program — Rörlighet helkropp (fullt + kort) och
-- Rörlighet under belastning (endast fullt, ingen kort variant angiven).
--
-- Skrivet relationellt via slugs, precis som tidigare batchar. Insert-
-- satserna är idempotenta (on conflict do nothing). Alla övningsslugs
-- nedan är verifierade mot 0002_seed_exercises.sql — notera att "Back
-- Extension with Rotation" faktiskt har slugen 'back-extension-rotation'
-- (utan "with") i databasen.

-- 1) NYA PROGRAM ------------------------------------------------------------
insert into public.programs (slug, title, category, tier, level, description, hero_image) values
  (
    'rorlighet-helkropp',
    'Rörlighet helkropp',
    'rorlighet-helkropp',
    'premium',
    null,
    'För dig som bara vill mjuka upp kroppen från topp till tå. Det program med minst fokus på det posturala, kan trots det göra väldigt gott för kroppen. När du gör det här programmet, ta tillfället i akt att vara närvarande i kroppen, ta djupa andetag ner i diafragman, och försök varva ner även mentalt.',
    '/exercises/ankle-knee-crossover-twist.jpg'
  ),
  (
    'rorlighet-under-belastning',
    'Rörlighet under belastning',
    'rorlighet-belastning',
    'premium',
    null,
    'För många ger styrketräning med maximalt rörelseomfång bäst resultat för rörligheten. Att utmana ditt rörelseomfång är en filosofi i många av våra övningar, men övningarna i detta program sticker ut lite extra i sin förmåga att utmana din rörlighet i kroppen samtidigt som du jobbar upp din styrka.',
    '/exercises/squatting-overhead.jpg'
  )
on conflict (slug) do nothing;

-- 2) RÖRLIGHET HELKROPP — fullt program --------------------------------------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('runners-stretch', 0),
  ('spidey-crawls', 1),
  ('chair-quad-stretch', 2),
  ('sitting-one-leg-hip-stretch', 3),
  ('ankle-knee-crossover-twist', 4),
  ('wide-cobra', 5),
  ('static-dog-position', 6),
  ('standing-one-arm-chest-stretch', 7),
  ('standing-wall-clock', 8),
  ('squatting-at-door', 9),
  ('cats-and-dogs', 10)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'rorlighet-helkropp'
on conflict (program_id, exercise_id, variant) do nothing;

-- Rörlighet helkropp — kort variant
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('runners-stretch', 0),
  ('spidey-crawls', 1),
  ('wide-cobra', 2),
  ('squatting-at-door', 3),
  ('cats-and-dogs', 4)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'rorlighet-helkropp'
on conflict (program_id, exercise_id, variant) do nothing;

-- 3) RÖRLIGHET UNDER BELASTNING — fullt program (ingen kort variant) --------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('supine-foot-circles', 0),
  ('squatting-at-door', 1),
  ('lateral-lunges-wall', 2),
  ('squatting-overhead', 3),
  ('standing-wall-clock', 4),
  ('back-extension-rotation', 5),
  ('standing-forward-bends-sides-up-down', 6)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'rorlighet-under-belastning'
on conflict (program_id, exercise_id, variant) do nothing;
