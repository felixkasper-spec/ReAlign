-- Split long single-paragraph program descriptions into logical paragraphs
-- so the intro-collapse UI (which triggers after the first paragraph)
-- applies consistently across all programs, not just kontorsvardag.

update public.programs set description =
'Nivå 3 fortsätter den kontrollerade ökningen av belastning i nacke, axlar och bröstrygg.

Vi rekommenderar att du kört Nivå 2 några gånger innan du börjar här, så tekniken sitter.'
where slug = 'axlar-nacke-skulderblad-niva-3';

update public.programs set description =
'Ett fristående program med fokus på bålen — djup magmuskulatur, sidostabilitet och samspelet mellan bål och hållningsmuskler.

Övningarna är alltså justerade så att bålmuskulaturen kan arbeta tillsammans med hållningsmusklerna, då många har svårt med det.'
where slug = 'baltraning';

update public.programs set description =
'Det här är ett nybörjarprogram för dig som är helt ny i postural träning.

Syftet är att hitta de viktigaste hållningsmusklerna, börja aktivera dem, och släppa på vanliga stelheter som annars är i vägen. En skonsam start som väcker hela kroppens hållningsmuskler till liv utan att belasta för hårt.'
where slug = 'helkropp-niva-1';

update public.programs set description =
'Nivå 2 tar vid där Nivå 1 slutade.

Här börjar vi aktivera och ta de första stegen i att stärka dina hållningsmuskler, samtidigt som vi fortsätter frigöra vanliga spänningar i kroppen.'
where slug = 'helkropp-niva-2';

update public.programs set description =
'Nivå 3 fortsätter den kontrollerade ökningen av belastning på dina hållningsmuskler.

Programmet är medelsvårt att göra med bra teknik — vi rekommenderar att du kört Nivå 2 några gånger innan du börjar här, så tekniken sitter.'
where slug = 'helkropp-niva-3';

update public.programs set description =
'Nu tar vi steget mot en riktig styrka i hållningsmusklerna — de tar mer och mer ansvar i din vardag.

Fortsatt progressiv belastning, kompletterat med övningar med nyttiga funktioner. Vi börjar också göra lite bredare övningar där olika kroppsdelar får träna på att samspela funktionellt.'
where slug = 'helkropp-niva-4';

update public.programs set description =
'Det här är det sista programmet som bara använder kroppsvikt.

Vill du utmana dig vidare efter det här går du vidare till programmen med redskap. Lägg extra uppmärksamhet på att få med hållningsmusklerna även i de tyngre övningarna — se instruktionerna inne i respektive övning.'
where slug = 'helkropp-niva-5';

update public.programs set description =
'Nivå 3 fortsätter den kontrollerade ökningen av belastning på höfterna, med mer krävande övningar för styrka och stabilitet.

Vi rekommenderar att du kört Nivå 2 några gånger innan du börjar här, så tekniken sitter.'
where slug = 'hofter-niva-3';

update public.programs set description =
'Ett mer utmanande program för dig som inriktat på knäproblematik eller brist på funktion, stabilitet eller styrka i knäna. Kombineras med relevanta posturala övningar för bästa möjliga resultat.

VIKTIGT: Du väljer hur djupt du går i varje övning. Sträva efter en fin balans mellan att utmana dig själv men att du ändå känner att du har kontroll på tekniken. Känner du ett obehag i knäna ska du antingen göra övningen med kortare rörelseomfång eller hoppa över övningen.'
where slug = 'knafokus-avancerad';

update public.programs set description =
'Ett mjukare program inriktat på knäproblematik eller brist på funktion, stabilitet eller styrka i knäna. Kombineras med relevanta posturala övningar för bästa möjliga resultat.

Fokus kommer även vara på att underlätta för kroppen att ha rakare fotposition, då detta är avgörande för nöjda knän.'
where slug = 'knafokus-mjukt';

update public.programs set description =
'För dig som bara vill mjuka upp kroppen från topp till tå. Det program med minst fokus på det posturala, kan trots det göra väldigt gott för kroppen.

När du gör det här programmet, ta tillfället i akt att vara närvarande i kroppen, ta djupa andetag ner i diafragman, och försök varva ner även mentalt.'
where slug = 'rorlighet-helkropp';

update public.programs set description =
'För många ger styrketräning med maximalt rörelseomfång bäst resultat för rörligheten.

Att utmana ditt rörelseomfång är en filosofi i många av våra övningar, men övningarna i detta program sticker ut lite extra i sin förmåga att utmana din rörlighet i kroppen samtidigt som du jobbar upp din styrka.'
where slug = 'rorlighet-under-belastning';

update public.programs set description =
'Många har svårt att få tydlig kontakt med sätet i vardag och träning, detta sätter mycket belastning på framför allt ländrygg och baksida lår. Känner du dig träffad kan det vara en bra idé att göra detta program.

Lägg fokus på att verkligen leta efter aktivering och arbete i just sätet under alla övningar som siktar in sig på sätet. Kombineras med relevanta posturala övningar för bästa möjliga resultat.'
where slug = 'vacka-satet-avancerat';

update public.programs set description =
'Många har svårt att få tydlig kontakt med sätet i vardag och träning, detta sätter mycket belastning på framför allt ländrygg och baksida lår. Känner du dig träffad kan det vara en bra idé att göra detta program.

Lägg fokus på att verkligen leta efter aktivering och arbete i just sätet under alla övningar som siktar in sig på sätet. Kombineras med relevanta posturala övningar för bästa möjliga resultat.'
where slug = 'vacka-satet-mjukt';
