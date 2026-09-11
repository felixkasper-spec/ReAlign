-- Kampanjmärkning för intresseanmälningar, så coachen kan se i adminlistan
-- vilken annons/kampanj som gav vilket lead. Fylls i från UTM-parametrar i
-- annonslänken (?utm_source=facebook&utm_campaign=...), inte från Metas
-- fbclid — den skickas bara vidare till Conversions API, se
-- lib/server-conversion.ts.
alter table public.coaching_leads
  add column utm_source text,
  add column utm_medium text,
  add column utm_campaign text;
