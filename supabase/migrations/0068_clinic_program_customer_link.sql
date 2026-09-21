-- Kopplar ett kundprogram till en specifik kund (telefonnummer, precis som
-- journal/formulär) så att man kan se "tidigare program" på kundens profil
-- och skicka länken direkt via sms/mejl utan att skriva in kontaktuppgifter
-- manuellt. Nullable eftersom äldre program skapades utan koppling till en
-- specifik kund.
alter table public.clinic_programs
  add column customer_phone text,
  add column customer_name text,
  add column customer_email text;

create index clinic_programs_customer_phone_idx
  on public.clinic_programs (customer_phone);
