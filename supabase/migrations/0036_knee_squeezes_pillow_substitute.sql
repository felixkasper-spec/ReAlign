-- Applied live via Supabase (data change). Both exercises require a pillow
-- between the knees but were tagged "Ingen utrustning" (no equipment) with
-- no fallback mentioned — a real blocker on the very first exercise of both
-- Kontorsvardag (sitting-knee-squeezes) and the 5-minute program
-- (hooklying-knee-squeezes). Adds a visible substitute suggestion high up
-- in the instructions, and corrects the equipment tag.

update public.exercises
set
  equipment = 'Kudde eller handduk',
  instructions = 'Övningen syftar till att aktivera och balansera insidan av låren samt att främja en indirekt aktivering av höftböjarna (iliopsoas) för att stabilisera bäckenet och förhindra att det faller bakåt, vilket motverkar en utplaning av svanken.

Har du ingen kudde? En hoprullad tröja eller ihopvikt handduk funkar lika bra.

- Ligg på rygg med böjda knän och placera fötterna höftbrett isär, riktade rakt fram (tredje tån pekar framåt). Lägg en cirka 15 cm tjock kudde mellan knäna och låt armarna vila i en 45-gradig vinkel från kroppen, med handflatorna uppåt.
- Säkerställ att du har en neutral svank – du ska kunna få plats med en handflata under svanken, varken mer eller mindre. Bibehåll denna position medan du pressar inåt mot kudden med hjälp av insidan av låren och ljumskarna. Trycket bör gradvis öka och vara jämnt mellan vänster och höger ben under cirka 5 sekunder. Slappna sedan av helt.
- Till en början kan du öka trycket till omkring 40 % av ditt max, men när du blivit bekant med övningen och kan öka trycket utan att aktivera andra muskler än insidan av låren och ljumskarna, kan du öka till 70–80 % av max.
- Upprepa övningen och var noggrann med att bibehålla en neutral svank samt att hålla mag-, rygg- och skuldermuskulaturen avslappnad. Sträva efter att känna en liksidig aktivering i båda låren och ljumskarna.'
where slug = 'hooklying-knee-squeezes';

update public.exercises
set
  equipment = 'Kudde eller handduk',
  instructions = 'Övningen stärker insidorna av låren och de djupa höftböjarna i deras stabiliserande roll och förbättrar kroppens förmåga att sitta med bra hållning genom att aktivera höftböjarna istället för ytliga ryggmuskler.

Har du ingen kudde? En hoprullad tröja eller ihopvikt handduk funkar lika bra.

- Sitt på en stol eller pall med höfterna i en 90-gradig vinkel (inte högre).
- Placera en kudde mellan knäna, håll fötterna i knytnävsbredd med tredje tån pekandes rakt fram och hälarna rakt under knäna.
- Slappna av magen och tippa bäckenet framåt så att du får en naturlig svank i nedre ländryggen. Övriga ryggen sträcker sig naturligt så att axlarna är placerade rakt ovanför höfterna.
- Håll den framåttippade bäckenpositionen och låt magen vara helt avslappnad.
- Tryck liksidigt och mjukt inåt mot kudden i 4–5 sekunder, med gradvis ökat tryck, och slappna sedan av i 1–2 sekunder mellan trycken.
- Sträva efter att komma upp till 30–40 % av maxtryck initialt, och öka sedan till 70–80 % när du kan hålla bäckenpositionen stabilt utan att spänna andra muskler än insida lår och höftböjare.
- Om du känner att du aktiverar svanken mer än insidan av låren kan det bero på att du lutar överkroppen lätt framåt eller inte slappnar av i magen tillräckligt.
- Behåll hälarna rakt under knäna och se till att fötterna pekar rakt framåt genom hela övningen.'
where slug = 'sitting-knee-squeezes';
