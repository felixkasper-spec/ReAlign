-- Move "Sitting Cats And Dogs" to the end of Kontorsvardag instead of first.
-- Applied live via Supabase (data change).

update public.program_exercises set order_index = 0
where variant = 'full' and program_id = (select id from public.programs where slug = 'kontorsvardag')
  and exercise_id = (select id from public.exercises where slug = 'sitting-knee-squeezes');

update public.program_exercises set order_index = 1
where variant = 'full' and program_id = (select id from public.programs where slug = 'kontorsvardag')
  and exercise_id = (select id from public.exercises where slug = 'sitting-single-hip-lifts');

update public.program_exercises set order_index = 2
where variant = 'full' and program_id = (select id from public.programs where slug = 'kontorsvardag')
  and exercise_id = (select id from public.exercises where slug = 'sitting-arm-circles');

update public.program_exercises set order_index = 3
where variant = 'full' and program_id = (select id from public.programs where slug = 'kontorsvardag')
  and exercise_id = (select id from public.exercises where slug = 'sitting-cats-and-dogs');
