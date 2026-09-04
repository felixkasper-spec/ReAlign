-- Byter namn på Bålträning-programmet till "Postural Bålträning" och
-- lägger till en introtext, i linje med den tidigare
-- Postural Gymträning-namnändringen.
update public.programs
set
  title = 'Postural Bålträning',
  description = 'Ett fristående program med fokus på bålen — djup magmuskulatur, sidostabilitet och samspelet mellan bål och hållningsmuskler. Övningarna är alltså justerade så att bålmuskulaturen kan arbeta tillsammans med hållningsmusklerna, då många har svårt med det.'
where slug = 'baltraning';
