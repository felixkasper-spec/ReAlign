-- Konton skapas bara med e-post (inget telefonnummer samlas in vid
-- registrering på /signup), men customers.phone var hittills obligatoriskt
-- — gjorde det omöjligt att ge en ren prenumerant (ingen bokning/journal
-- än) en egen kundrad, så de syntes aldrig i /coaching/kunder. E-post är
-- det enda fält ett konto alltid har, så den blir nu den andra nyckeln en
-- kundrad kan identifieras med när telefon ännu saknas.
alter table public.customers alter column phone drop not null;

create unique index customers_email_unique_idx
  on public.customers (email)
  where email is not null;

-- Skapar (eller kopplar in på) en kundrad per konto direkt vid
-- registrering — annars dyker en ren prenumerant utan telefon aldrig upp
-- i kundlistan. ON CONFLICT DO UPDATE här är ren SQL mot en specifik
-- kolumn, inte supabase-js-klientens .upsert() (se lib/customer-upsert.ts
-- för den bekanta buggen där), så den rör bara linked_user_id och
-- nollställer aldrig namn/telefon på en redan existerande rad.
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
  on conflict (email) do update
    set linked_user_id = excluded.linked_user_id;

  return new;
end;
$$;
