-- Applied live via Supabase (data change). Free exercise, not yet part of
-- any program — will be added to a free program later.

insert into public.exercises (slug, title, body_part, equipment, video_url, sets_reps, instructions, tips, is_premium)
values (
  'tapping',
  'Tapping',
  'Helkropp',
  'Ingen utrustning',
  'https://player.vimeo.com/video/1224451068?h=bf9be650dc&title=0&byline=0&portrait=0',
  '2-3 x 20 knackningar per punkt',
  'Tapping hjälper till att lugna och balansera akupunktursystemet och nervsystemet, vilket bidrar till ökat välbefinnande.

- Knacka mjukt igenom punkterna i videon i lugn takt.
- Använd fingertopparna för att knacka och gör 20 knackningar per punkt.
- Knacka gärna igenom alla punkterna minst 2-3 gånger för bästa effekt.
- Efter knackningarna kommer de flesta att känna sig mer avslappnade och närvarande i kroppen.',
  'Ingen övning får göra ont, då kan du skippa just den övningen. Målet med varje övning ska vara att känna att övningen tar just där den ska ta — antingen en känsla av stretch/töjning om övningen är en stretch eller av aktivering/träning om övningen är en träningsövning. Följ därför instruktionerna så noggrant som möjligt för att hitta känslan på rätt ställe.',
  false
);
