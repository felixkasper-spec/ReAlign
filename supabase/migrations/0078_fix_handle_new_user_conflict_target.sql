-- Fix för 0077: ON CONFLICT (email) matchade inte det partiella unika
-- indexet (customers_email_unique_idx, "where email is not null") utan att
-- samma villkor upprepas i ON CONFLICT-satsen — Postgres kunde då inte
-- avgöra vilket index som skulle användas som "arbiter" vid krock, vilket
-- fick HELA registreringen att misslyckas med "Database error saving new
-- user" (triggern körs i samma transaktion som auth.users-inserten).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.customers (email, linked_user_id)
  values (new.email, new.id)
  on conflict (email) where email is not null do update
    set linked_user_id = excluded.linked_user_id;

  return new;
end;
$$;
