-- Ergonomivideorna från /ergonomi (sitta, stå, lyfta/framåtfällningar) som
-- egna, återanvändbara övningar i övningsbiblioteket, så de går att lägga
-- till i kundprogram precis som vilken annan övning som helst. Egen kategori
-- ("Ergonomi") eftersom de handlar om vardagshållning snarare än en
-- specifik kroppsdel. Samma Vimeo-länkar som redan används på /ergonomi.
insert into public.exercises (slug, title, body_part, video_url, instructions)
values
  (
    'ergonomi-sitta',
    'Ergonomi: Sitta',
    'Ergonomi',
    'https://player.vimeo.com/video/1218399947?h=1a3cddd537&title=0&byline=0&portrait=0',
    'De flesta av oss sitter 6–9 timmar per dag. Det handlar inte om att sitta "perfekt" hela tiden, utan om att undvika samma statiska position för länge.

Sitt med fötterna platt i golvet och en naturlig svank. Vill du ha en extra hållningsstärkande position, sitt långt fram på stolskanten med rak rygg. Res dig upp minst en gång per 30 minuter — även en kort paus bryter den statiska belastningen. Skärmens överkant i höjd med ögonen, en armlängd bort. Håll mobilen i ögonhöjd istället för att böja nacken nedåt mot den.'
  ),
  (
    'ergonomi-sta',
    'Ergonomi: Stå',
    'Ergonomi',
    'https://player.vimeo.com/video/1218400129?h=a58bf4e414&title=0&byline=0&portrait=0',
    'Stående vila är sällan verklig vila för kroppen — vanan att luta sig i en höft belastar snett över tid.

Stå med fötterna i höftbredd, pekandes rakt fram, med jämn belastning på båda fötterna. Föreställ dig en tråd som drar rakt upp genom hjässan, och slappna av i mage, ländrygg och säte. Byt ståställning aktivt istället för att fastna i en position — kroppen gillar variation, inte perfekt hållning i timmar.'
  ),
  (
    'ergonomi-lyfta',
    'Ergonomi: Lyfta och framåtfällningar',
    'Ergonomi',
    'https://player.vimeo.com/video/1218398436?h=3622425e3c&title=0&byline=0&portrait=0',
    'De flesta ryggskador vid lyft sker inte av tunga saker, utan av lätta saker lyfta fel — ofta i en vriden position.

Böj knäna och håll ryggen rak — fäll dig framåt från höfterna eller gör ett utfall istället för att böja i ländryggen. Håll lasten nära kroppen genom hela lyftet och vänd hela kroppen med fötterna, inte bålen. Andas ut på vägen upp — det stabiliserar bålen naturligt.'
  );
