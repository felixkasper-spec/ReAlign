-- Kort kundvänd beskrivning per tjänst, visas på den publika bokningssidan
-- när den byggs. Nullable — en tjänst utan beskrivning visar helt enkelt
-- ingen brödtext, inget krav att fylla i alla på en gång.
alter table public.booking_services
  add column description text;
