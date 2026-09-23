-- Google Drive-länk per kund för filer som är för stora/otympliga för
-- chattens inbyggda bilaga (25 MB-tak, se lib/coaching-attachments.ts) —
-- t.ex. längre videor. Coachen skapar och delar mappen manuellt i sitt eget
-- Drive-konto (rekommenderat: en "filförfrågan"-länk, inte "alla med länken
-- kan redigera", så kunden bara kan lämna filer utan att se eller kunna
-- ändra andra kunders innehåll) och klistrar in länken här — ingen
-- Drive-integration/API, bara en lagrad URL som visas i chatten på båda
-- sidor.
alter table public.profiles
  add column drive_folder_url text;
