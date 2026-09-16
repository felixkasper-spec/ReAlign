-- Atomiskt byte av ett kundprograms övningslista (delete+insert i EN
-- transaktion). Tidigare gjordes detta som två separata anrop från
-- serverkoden (actions.ts) utan felkontroll på insert-steget — om
-- inserten misslyckades (t.ex. samma övning tillagd två gånger i
-- byggaren, vilket krockar med clinic_program_exercises_unique_exercise)
-- hade raderna redan tagits bort men inga nya sattes in, och kundens
-- redan utskickade länk pekade plötsligt på ett tomt program (404 på
-- /p/[token] eftersom sidan kräver minst en övning). Genom att göra allt
-- inuti en enda plpgsql-funktion rullas HELA operationen tillbaka om
-- något steg misslyckas — länken fortsätter peka på det gamla, fungerande
-- innehållet tills ett giltigt sparande faktiskt lyckas.
create or replace function public.replace_clinic_program_exercises(
  p_clinic_program_id uuid,
  p_rows jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.clinic_program_exercises
  where clinic_program_id = p_clinic_program_id;

  insert into public.clinic_program_exercises (
    clinic_program_id, exercise_id, custom_title, custom_video_url, notes, order_index
  )
  select
    p_clinic_program_id,
    nullif(r->>'exercise_id', '')::uuid,
    r->>'custom_title',
    r->>'custom_video_url',
    r->>'notes',
    (r->>'order_index')::int
  from jsonb_array_elements(p_rows) as r;
end;
$$;

revoke all on function public.replace_clinic_program_exercises(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.replace_clinic_program_exercises(uuid, jsonb) to service_role;
