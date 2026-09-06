-- Applied live via Supabase (data change). Requires 0028's is_premium
-- column to already exist.

insert into public.exercises (slug, title, body_part, equipment, video_url, sets_reps, instructions, tips, is_premium)
values (
  'standing-belt-breathing',
  'Standing Belt Breathing',
  'Rygg',
  'Ingen utrustning',
  'https://player.vimeo.com/video/1224448194?h=e5b3fc44e2&title=0&byline=0&portrait=0',
  '2 x 12 andetag',
  'Övningen syftar till att stärka förmågan till sidobröstkorgsandning och stärker diafragman samt bröstkorgens andningsmuskulatur effektivt. Detta bidrar till en mer öppen och upprätt bröstkorg och bröstryggrad och därmed bättre hållning.

- Stå upp och korsa ett bälte eller bagageband runt den nedre delen av bröstkorgen.
- Håll med vänster hand om höger ände av bältet och med höger hand om vänster ände.
- Andas ut och dra åt bältet med hjälp av händerna så att bröstkorgen sjunker ihop så mycket som känns behagligt.
- Håll emot ordentligt med händerna när du nu andas in och fokusera på att vidga bröstkorgen så mycket som möjligt i alla riktningar.
- Känn att bröstkorgen vidgas liksidigt på höger och vänster sida, samtidigt som du strävar efter att känna att bröstkorgen även expanderar bakåt mot ryggen.
- Andas ut igen och dra åt bältet så att bröstkorgen sjunker ihop så mycket som känns ok.
- Upprepa övningen för valt antal repetitioner.
- Det är vanligt att bröstkorgen känns stelare på ena sidan. Genom att hålla emot med bältet blir det lättare att hitta sidan- och ryggbröstkorgsandningen och samtidigt hålla emot lagom mycket för att få maximal stärkande effekt på både diafragman och bröstkorgsmuskulaturen.',
  'Ingen övning får göra ont, då kan du skippa just den övningen. Målet med varje övning ska vara att känna att övningen tar just där den ska ta — antingen en känsla av stretch/töjning om övningen är en stretch eller av aktivering/träning om övningen är en träningsövning. Följ därför instruktionerna så noggrant som möjligt för att hitta känslan på rätt ställe.

I just denna övning vill du känna att bröstkorgen vidgas åt alla håll och att diafragman aktiveras effektivt. Målet är att känna en ökad rörlighet och styrka i bröstkorgsmuskulaturen, vilket hjälper till att förbättra hållningen och andningen.',
  true
);

update public.exercises set is_premium = true where slug = 'seated-trunk-rotation';
