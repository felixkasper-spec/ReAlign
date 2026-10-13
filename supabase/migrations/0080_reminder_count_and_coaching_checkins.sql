-- Träningspåminnelsen skickades hittills om och om igen var 7:e dag utan
-- något tak — byts till max 2 mejl totalt per person (en efter en vecka
-- inaktiv, en efter en månad), se app/api/cron/reminders. Räknaren
-- nollställs i koden (inte här) så fort personen tränat igen efter sitt
-- senaste påminnelsemejl, så en ny period av inaktivitet senare får en
-- egen, färsk tvåmejls-cykel.
alter table public.profiles
  add column reminder_count int not null default 0;

-- Varannan-veckan-avstämning (admin ber "hur går det?" + kollar ev. nya
-- övningar) för alla aktiva Premium Coaching-prenumeranter — en rad per
-- kund, uppdateras varje gång en avstämning skickas ELLER aktivt hoppas
-- över (båda nollställer 14-dagarsklockan, annars skulle en kund man
-- medvetet valt att vänta med dyka upp i listan igen nästa sidladdning).
-- Ingen rad alls = aldrig avstämd, due-datum räknas då från prenumerationens
-- startdatum istället (subscriptions.created_at).
create table public.coaching_checkins (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  last_checkin_at timestamptz not null default now()
);

alter table public.coaching_checkins enable row level security;
-- Ingen klientpolicy — samma mönster som övriga admin-bara-tabeller, bara
-- service-role-klienten (admin-sidan) kommer åt raderna.
