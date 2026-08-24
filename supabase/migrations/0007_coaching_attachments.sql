-- Bilder och videor i coaching-chatten: användaren laddar upp direkt till
-- Storage från webbläsaren via en signerad uppladdnings-URL (kringgår
-- Next.js/Vercels gräns för hur stor en request-body i en server action
-- får vara), och skickar sedan själva meddelandet med en referens till
-- filen. Bucketen är privat — läsning sker via signerade URL:er som
-- genereras när sidan renderas, inte via en publik bucket.

alter table public.coaching_messages
  alter column body drop not null,
  alter column body set default '',
  drop constraint coaching_messages_body_check,
  add column attachment_path text,
  add column attachment_type text check (attachment_type in ('image', 'video')),
  add constraint coaching_messages_has_content
    check (char_length(trim(body)) > 0 or attachment_path is not null);

insert into storage.buckets (id, name, public)
values ('coaching-attachments', 'coaching-attachments', false)
on conflict (id) do nothing;

-- Varje fil lagras under <user_id>/<filnamn> — policyerna nedan låter en
-- användare bara ladda upp och läsa filer i sin egen mapp. Coachen läser
-- via service_role-nyckeln, som kringgår de här policyerna helt.
create policy "Användare laddar upp egna bilagor"
  on storage.objects for insert
  with check (
    bucket_id = 'coaching-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Användare läser egna bilagor"
  on storage.objects for select
  using (
    bucket_id = 'coaching-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
