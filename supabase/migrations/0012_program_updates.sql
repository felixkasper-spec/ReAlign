-- Batch: två nya Rörlighet-program, korta varianter för Höft & ländrygg och
-- Axlar/nacke/skulderblad, en övningsswap, en omordning och två småfixar.
--
-- Alla ändringar är skrivna relationellt via slugs (inte hårdkodade
-- order_index-värden), så de fungerar oavsett exakt nuvarande innehåll i
-- program_exercises. Insert-satserna är idempotenta (on conflict do
-- nothing) så filen kan köras om utan att skapa dubbletter. Swap- och
-- omordnings-satserna för Höft & ländrygg Nivå 1/3 antar att de nämnda
-- övningarna redan finns i just det programmet/den variant som anges —
-- om antagandet är fel blir resultatet no-op (inget matchar) snarare än
-- fel data, men värt att stämma av efteråt.

-- 1) NYA PROGRAM ------------------------------------------------------------
insert into public.programs (slug, title, category, tier, level, description) values
  ('rorlighet-hofter-landrygg', 'Rörlighet höfter & ländrygg', 'rorlighet-hofter', 'premium', null, null),
  ('rorlighet-axlar-skulderblad-nacke', 'Rörlighet axlar/skulderblad/nacke', 'rorlighet-axlar', 'premium', null, null)
on conflict (slug) do nothing;

-- Rörlighet höfter & ländrygg — fullt program
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('runners-stretch', 0),
  ('chair-quad-stretch', 1),
  ('sitting-one-leg-hip-stretch', 2),
  ('spidey-crawls', 3),
  ('pelvic-rolls', 4),
  ('supine-foot-circles', 5)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'rorlighet-hofter-landrygg'
on conflict (program_id, exercise_id, variant) do nothing;

-- Rörlighet höfter & ländrygg — kort variant
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('runners-stretch', 0),
  ('spidey-crawls', 1),
  ('supine-foot-circles', 2)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'rorlighet-hofter-landrygg'
on conflict (program_id, exercise_id, variant) do nothing;

-- Rörlighet axlar/skulderblad/nacke — fullt program
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('standing-one-arm-chest-stretch', 0),
  ('standing-arm-rotation', 1),
  ('wide-cobra', 2),
  ('static-dog-position', 3),
  ('cats-and-dogs', 4),
  ('standing-wall-clock', 5),
  ('standing-shoulder-shrugs', 6)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'rorlighet-axlar-skulderblad-nacke'
on conflict (program_id, exercise_id, variant) do nothing;

-- Rörlighet axlar/skulderblad/nacke — kort variant
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('wide-cobra', 0),
  ('standing-wall-clock', 1),
  ('standing-shoulder-shrugs', 2)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'rorlighet-axlar-skulderblad-nacke'
on conflict (program_id, exercise_id, variant) do nothing;

-- 2) HÖFT & LÄNDRYGG NIVÅ 1: byt sitting-one-leg-hip-stretch mot spidey-crawls (fullt program) ---
with removed as (
  delete from public.program_exercises
  where program_id = (select id from public.programs where slug = 'hofter-niva-1')
    and variant = 'full'
    and exercise_id = (select id from public.exercises where slug = 'sitting-one-leg-hip-stretch')
  returning program_id, order_index, variant
)
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select r.program_id, (select id from public.exercises where slug = 'spidey-crawls'), r.order_index, r.variant
from removed r
where not exists (
  select 1 from public.program_exercises pe2
  where pe2.program_id = r.program_id and pe2.variant = r.variant
    and pe2.exercise_id = (select id from public.exercises where slug = 'spidey-crawls')
);

-- 3) HÖFT & LÄNDRYGG — korta varianter -------------------------------------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('spidey-crawls', 0),
  ('hooklying-knee-squeezes', 1),
  ('hooklying-single-hip-lifts', 2)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'hofter-niva-1'
on conflict (program_id, exercise_id, variant) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('sitting-knee-squeezes', 0),
  ('sitting-single-hip-lifts', 1),
  ('supine-foot-circles', 2)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'hofter-niva-2'
on conflict (program_id, exercise_id, variant) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('pelvic-rolls-wall', 0),
  ('inner-thigh-lifts', 1),
  ('squatting-at-door', 2)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'hofter-niva-3'
on conflict (program_id, exercise_id, variant) do nothing;

-- Höft & ländrygg Nivå 3, fullt program: byt ordning på inner-thigh-lifts och squatting-at-door
update public.program_exercises
set order_index = case
  when exercise_id = (select id from public.exercises where slug = 'inner-thigh-lifts')
    then (select order_index from public.program_exercises
          where program_id = (select id from public.programs where slug = 'hofter-niva-3')
            and variant = 'full'
            and exercise_id = (select id from public.exercises where slug = 'squatting-at-door'))
  when exercise_id = (select id from public.exercises where slug = 'squatting-at-door')
    then (select order_index from public.program_exercises
          where program_id = (select id from public.programs where slug = 'hofter-niva-3')
            and variant = 'full'
            and exercise_id = (select id from public.exercises where slug = 'inner-thigh-lifts'))
end
where program_id = (select id from public.programs where slug = 'hofter-niva-3')
  and variant = 'full'
  and exercise_id in (
    (select id from public.exercises where slug = 'inner-thigh-lifts'),
    (select id from public.exercises where slug = 'squatting-at-door')
  );

-- 4) AXLAR/NACKE/SKULDERBLAD — korta varianter -----------------------------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('static-back-goal-post-presses', 0),
  ('static-back-reverse-presses', 1),
  ('standing-arm-circles', 2)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'axlar-nacke-skulderblad-niva-1'
on conflict (program_id, exercise_id, variant) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('standing-shoulder-shrugs', 0),
  ('standing-arm-circles', 1),
  ('hooklying-neck-training', 2)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'axlar-nacke-skulderblad-niva-2'
on conflict (program_id, exercise_id, variant) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'kort'
from public.programs p
join (values
  ('standing-arm-circles', 0),
  ('active-floor-clock', 1),
  ('standing-forward-bends-sides-up-down', 2)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'axlar-nacke-skulderblad-niva-3'
on conflict (program_id, exercise_id, variant) do nothing;

-- 5) KONTORSVARDAG: ta bort Standups ----------------------------------------
delete from public.program_exercises
where program_id = (select id from public.programs where slug = 'kontorsvardag')
  and exercise_id = (select id from public.exercises where slug = 'standups');

-- 6) HELKROPP NIVÅ 2: lägg Cats and dogs sist (fullt program) --------------
insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select
  (select id from public.programs where slug = 'helkropp-niva-2'),
  (select id from public.exercises where slug = 'cats-and-dogs'),
  coalesce((select max(order_index) from public.program_exercises
    where program_id = (select id from public.programs where slug = 'helkropp-niva-2')
      and variant = 'full'), -1) + 1,
  'full'
where not exists (
  select 1 from public.program_exercises
  where program_id = (select id from public.programs where slug = 'helkropp-niva-2')
    and variant = 'full'
    and exercise_id = (select id from public.exercises where slug = 'cats-and-dogs')
);
