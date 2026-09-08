-- Enkel attribuering: varifrån kom ett nytt konto? Sätts bara när
-- registreringslänken bär en ?source=... (t.ex. kundprogram-länkarna),
-- annars null (vanlig organisk/annons-trafik utan särskild källa).
alter table public.profiles
  add column signup_source text;
