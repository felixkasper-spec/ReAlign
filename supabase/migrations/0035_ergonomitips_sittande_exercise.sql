-- Applied live via Supabase (data change). Turns Kontorsvardag's separate
-- ergonomi video section into a regular "5th exercise" in the program's
-- flow/list, so it appears alongside the others instead of as a standalone
-- block below the exercise list.

insert into public.exercises (slug, title, body_part, equipment, video_url, instructions, tips, is_premium)
values (
  'ergonomitips-sittande',
  'Ergonomitips - Sittande',
  'Ergonomi',
  'Ingen utrustning',
  'https://player.vimeo.com/video/1218399947?h=1a3cddd537&title=0&byline=0&portrait=0',
  'Enkla och konkreta tips om hur du sitter på ett ergonomiskt sätt.

- Sitt med fötterna platt i golvet och en naturlig svank. Vill du ha en extra hållningsstärkande position, sitt långt fram på stolskanten med rak rygg.
- Skärmens överkant i höjd med ögonen, en armlängd bort.
- Håll mobilen i ögonhöjd istället för att böja nacken nedåt mot den.
- Häng inte i ländryggsstödet — aktivera bålen lätt istället för att kollapsa in i stolen.
- Om du korsar benen, växla sida då och då för att undvika snedbelastning.',
  'Res dig upp minst en gång per 30 minuter — även en kort paus bryter den statiska belastningen.',
  false
);

insert into public.program_exercises (program_id, exercise_id, order_index, variant, is_warmup)
select
  (select id from public.programs where slug = 'kontorsvardag'),
  (select id from public.exercises where slug = 'ergonomitips-sittande'),
  4,
  'full',
  false;
