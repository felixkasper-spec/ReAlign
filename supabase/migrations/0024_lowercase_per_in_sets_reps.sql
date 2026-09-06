-- Lowercase the "Per" qualifier word (per sida, per ben, per arm, etc.)
-- inside exercises.sets_reps — it's a mid-clause word, not a sentence
-- start, so it shouldn't be capitalized.

update public.exercises
set sets_reps = regexp_replace(sets_reps, '\yPer\y', 'per', 'g')
where sets_reps ~ '\yPer\y';
