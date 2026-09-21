-- Låter en bokning avvika från tjänstens standardpris (t.ex. rabatt eller
-- paketpris) och ge bokningen en egen färg i kalenderrutnätet, oberoende av
-- vilken tjänst den gäller. Nullable eftersom äldre bokningar saknar båda —
-- lib/booking-colors.ts respektive tjänstens eget pris används som
-- fallback när de är null.
alter table public.bookings
  add column price_sek int,
  add column color text;
