-- Ny övning, tillagd direkt i övningsbanken (och därmed valbar i
-- programbyggaren utan extra steg). Samma innehåll som motsvarande
-- migration på Cleer Klinik-sidan (0040_sitting_trap_stretch.sql).
insert into public.exercises (slug, title, body_part, equipment, video_url, instructions, tips, sets_reps, duration_seconds)
values (
  'sitting-trap-stretch',
  'Sitting Trap Stretch',
  'Nacke & axlar & skulderblad',
  'Stol',
  'https://player.vimeo.com/video/1230958002?h=fd4aa74126&title=0&byline=0&portrait=0',
  $$Övningen släpper på djupa spänningar i övre delen av trapeziusmuskeln och bidrar till en avslappnad och sänkt axelposition.

- Sitt på en stol med upprätt kroppsposition.
- Greppa tag med ena handen under stolen.
- Luta nu kroppen åt sidan i motsatt riktning från handen under stolen.
- Böj huvudet åt samma håll som du lutar mot, med ansiktet framåt (utan att vrida huvudet).
- Känn en stretch i muskeln som sitter mellan axeln och nacken (trapezius).
- Håll angivet antal sekunder och byt sedan sida.$$,
  'Ingen övning får göra ont, då kan du skippa just den övningen. I den här övningen vill du känna en stretch på sidan av nacken/axeln — det kan kännas på fler ställen också, och det är helt okej så länge du känner något i området vi siktar på.',
  '2 x 1 min per sida',
  240
)
on conflict (slug) do update set
  title = excluded.title,
  body_part = excluded.body_part,
  equipment = excluded.equipment,
  video_url = excluded.video_url,
  instructions = excluded.instructions,
  tips = excluded.tips,
  sets_reps = excluded.sets_reps,
  duration_seconds = excluded.duration_seconds;
