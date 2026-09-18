-- Spårar om uppföljningspåminnelse 2/3 redan skickats för ett lead, istället
-- för att räkna ut "är det dags idag?" från ett smalt dygns-fönster
-- (daysSince >= 1 && < 2) varje gång cronen kör. Det smala fönstret gjorde
-- att en påminnelse kunde hamna "mellan" två körningar om tidpunkten inte
-- stämde exakt, och det fanns heller ingen koppling till om coachen faktiskt
-- ringt igen sedan senaste statusändringen — bara ATT statusen en gång
-- sattes till "no_answer". Med dessa kolumner blir logiken "har X dagar gått
-- OCH har vi inte redan notifierat" — kan aldrig missas permanent, och
-- nollställs varje gång coachen loggar ett nytt samtalsförsök.
alter table public.coaching_leads
  add column followup_2_sent_at timestamptz,
  add column followup_3_sent_at timestamptz;
