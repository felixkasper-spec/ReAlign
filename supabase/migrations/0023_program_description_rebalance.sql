-- Follow-up to 0022: some first paragraphs ended up too short (a single
-- terse sentence) to be informative before the "Läs mer" toggle. Rebalances
-- the paragraph split so the visible preview carries more real content —
-- merging sentences into paragraph 1 where useful, and undoing the split
-- entirely for two programs whose full text was short enough that hiding
-- part of it added no value.

update public.programs set description =
'Nivå 3 fortsätter den kontrollerade ökningen av belastning i nacke, axlar och bröstrygg. Vi rekommenderar att du kört Nivå 2 några gånger innan du börjar här, så tekniken sitter.'
where slug = 'axlar-nacke-skulderblad-niva-3';

update public.programs set description =
'Det här är ett nybörjarprogram för dig som är helt ny i postural träning. Syftet är att hitta de viktigaste hållningsmusklerna, börja aktivera dem, och släppa på vanliga stelheter som annars är i vägen.

En skonsam start som väcker hela kroppens hållningsmuskler till liv utan att belasta för hårt.'
where slug = 'helkropp-niva-1';

update public.programs set description =
'Nivå 2 tar vid där Nivå 1 slutade. Här börjar vi aktivera och ta de första stegen i att stärka dina hållningsmuskler, samtidigt som vi fortsätter frigöra vanliga spänningar i kroppen.'
where slug = 'helkropp-niva-2';

update public.programs set description =
'Nivå 3 fortsätter den kontrollerade ökningen av belastning på dina hållningsmuskler. Programmet är medelsvårt att göra med bra teknik.

Vi rekommenderar att du kört Nivå 2 några gånger innan du börjar här, så tekniken sitter.'
where slug = 'helkropp-niva-3';

update public.programs set description =
'Nu tar vi steget mot en riktig styrka i hållningsmusklerna — de tar mer och mer ansvar i din vardag. Fortsatt progressiv belastning, kompletterat med övningar med nyttiga funktioner.

Vi börjar också göra lite bredare övningar där olika kroppsdelar får träna på att samspela funktionellt.'
where slug = 'helkropp-niva-4';

update public.programs set description =
'Det här är det sista programmet som bara använder kroppsvikt. Vill du utmana dig vidare efter det här går du vidare till programmen med redskap.

Lägg extra uppmärksamhet på att få med hållningsmusklerna även i de tyngre övningarna — se instruktionerna inne i respektive övning.'
where slug = 'helkropp-niva-5';

update public.programs set description =
'För många ger styrketräning med maximalt rörelseomfång bäst resultat för rörligheten. Att utmana ditt rörelseomfång är en filosofi i många av våra övningar.

Men övningarna i detta program sticker ut lite extra i sin förmåga att utmana din rörlighet i kroppen samtidigt som du jobbar upp din styrka.'
where slug = 'rorlighet-under-belastning';
