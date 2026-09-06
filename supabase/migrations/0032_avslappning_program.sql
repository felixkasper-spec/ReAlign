-- Nytt program: Avslappning. Enda variant (ingen kort). Alla övningsslugs
-- verifierade mot 0002_seed_exercises.sql / 0029 / 0030.

insert into public.programs (slug, title, category, tier, level, description) values
  ('avslappning', 'Avslappning', 'avslappning', 'premium', null, null)
on conflict (slug) do nothing;

insert into public.program_exercises (program_id, exercise_id, order_index, variant)
select p.id, e.id, x.ord, 'full'
from public.programs p
join (values
  ('tapping', 0),
  ('standing-belt-breathing', 1),
  ('static-back-knee-squeezes', 2),
  ('static-back-reverse-presses', 3),
  ('cats-and-dogs', 4)
) as x(slug, ord) on true
join public.exercises e on e.slug = x.slug
where p.slug = 'avslappning'
on conflict (program_id, exercise_id, variant) do nothing;
