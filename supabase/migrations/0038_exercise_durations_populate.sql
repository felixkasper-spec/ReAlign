-- Applied live via Supabase (data change). Populates duration_seconds for
-- the exercises used in the new session-player mode (5-minutersprogrammet
-- and Kontorsvardag) — estimated from each exercise's sets_reps text.

update public.exercises set duration_seconds = 150 where slug = 'hooklying-knee-squeezes';
update public.exercises set duration_seconds = 120 where slug = 'hooklying-single-hip-lifts';
update public.exercises set duration_seconds = 150 where slug = 'static-back-goal-post-presses';

update public.exercises set duration_seconds = 150 where slug = 'sitting-knee-squeezes';
update public.exercises set duration_seconds = 120 where slug = 'sitting-single-hip-lifts';
update public.exercises set duration_seconds = 90 where slug = 'sitting-arm-circles';
update public.exercises set duration_seconds = 90 where slug = 'sitting-cats-and-dogs';
update public.exercises set duration_seconds = 115 where slug = 'ergonomitips-sittande';
