-- Kopplar ett upplägg till en kund deterministiskt via telefonnummer
-- istället för bara fritextnamnet — behövs för att kunna visa/skapa
-- upplägg direkt från kundsidan (se UpplaggCard.tsx i
-- app/coaching/kunder/[phone]/), portat från Cleer Klinik.
alter table public.client_packages
  add column customer_phone text;
