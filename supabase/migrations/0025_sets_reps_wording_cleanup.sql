-- Various content fixes to exercises.sets_reps and one equipment fix,
-- all applied live via Supabase (data-only change, no code deploy needed).

-- Custom rewrites
update public.exercises set sets_reps = '2 x 8 lyft/sida · Aktivering Ljumske & rygg/axlar' where slug = 'cross-crawling';
update public.exercises set sets_reps = '2 x 10 per ben · Aktivering Insida ljumske (höftböjare)' where slug = 'hooklying-single-hip-lifts';
update public.exercises set sets_reps = '2 x 10 Cirklar/riktning per ben · Aktivering Höftböjare' where slug = 'supine-foot-circles';
update public.exercises set sets_reps = '2 x 1 min' where slug = 'airbench';

-- Drop "Repetitioner" from the first (displayed) segment — keep just the number
update public.exercises set sets_reps = '2 x 6-10 · Aktivering Rygg, skulderblad & axlar' where slug = 'active-floor-clock';
update public.exercises set sets_reps = '2 x 10 · Aktivering Sätesmuskler' where slug = 'bridges-wide';
update public.exercises set sets_reps = '2 x 10 · Motorik & uppmjukning Höfter, rygg & skulderblad' where slug = 'cats-and-dogs';
update public.exercises set sets_reps = '2 x 12 · Byt fotposition Mellan seten · Aktivering Magmuskler (nedre)' where slug = 'crocodile-crunches';
update public.exercises set sets_reps = '2 x 10 · Efter förmåga Vikt (teknik viktigast) · Aktivering Säte, ljumske, lår & skulderblad' where slug = 'deadlift';
update public.exercises set sets_reps = '2 x 10 · Aktivering Höftböjare & nedre mage' where slug = 'hip-flexor-situps';
update public.exercises set sets_reps = '2 x 10 · Aktivering Inre höftböjare (ljumske)' where slug = 'pelvic-rolls-wall';
update public.exercises set sets_reps = '2 x 12 · På knä Vid behov · Aktivering Bröst, axlar, triceps & bål' where slug = 'postural-pushups';
update public.exercises set sets_reps = '2 x 10 · Fullt djup Anpassa efter förmåga · Aktivering Hela posturalkedjan' where slug = 'postural-squats';
update public.exercises set sets_reps = '2 x 10 · Efter förmåga Vikt · Aktivering Säte, ljumske & baklår' where slug = 'romanian-deadlift';
update public.exercises set sets_reps = '2 x 10 · Motorik & uppmjukning Höfter, bäcken & ländrygg' where slug = 'sitting-cats-and-dogs';
update public.exercises set sets_reps = '2 x 10 · Efter förmåga Vikt & djup · Aktivering Säte, ljumske & lår' where slug = 'squats-gym';
update public.exercises set sets_reps = '2 x 10 · Fullt djup Anpassa efter förmåga · Aktivering Ljumske, lår & säte' where slug = 'squatting-at-door';
update public.exercises set sets_reps = '2 x 10 · Fullt djup Anpassa efter förmåga · Aktivering Ljumske, säte, lår & rygg' where slug = 'squatting-overhead';
update public.exercises set sets_reps = '2 x 10 · Efter förmåga Vikt på hantlar · Aktivering Biceps, axlar & triceps' where slug = 'standing-curlpress';
update public.exercises set sets_reps = '2 x 10 · Spegel Rekommenderas · Aktivering Under & mellan skulderbladen' where slug = 'standing-shoulder-rolls';
update public.exercises set sets_reps = '2 x 10 · Spegel Rekommenderas · Aktivering Mellan & under skulderbladen' where slug = 'standing-shoulder-shrugs';
update public.exercises set sets_reps = '2 x 10 · Anpassa Stolhöjd & fotposition · Aktivering Ljumske, lår & säte' where slug = 'standups';
update public.exercises set sets_reps = '2 x 10 · ~5 sek per tryck · Aktivering Bakre axlar & skuldror' where slug = 'static-back-goal-post-presses';
update public.exercises set sets_reps = '2 x 10 · ~5 sek per repetition · Aktivering Insida lår' where slug = 'static-back-knee-squeezes';
update public.exercises set sets_reps = '2 x 10 · Ca 40% Av maxtryck · Aktivering Nedre skulderbladsmuskler' where slug = 'static-back-pullover-presses';
update public.exercises set sets_reps = '2 x 10 · ~5 sek per repetition · Aktivering Mellan skulderbladen' where slug = 'static-back-reverse-presses';
update public.exercises set sets_reps = '2 x 10 · Lugnt tempo Kontrollerad rörelse · Aktivering Djupa nackmuskler' where slug = 'static-dog-neck-retractions';

-- Drop "Håll positionen" from the first (displayed) segment
update public.exercises set sets_reps = '2 x 30-45 sek · Aktivering Övre rygg, mittrygg & ljumske' where slug = 'downward-dog';
update public.exercises set sets_reps = '2 x 45 sek · Stretch Bröstrygg, skuldror & axlar' where slug = 'kneeling-table-top-stretch';
update public.exercises set sets_reps = '2 x 30-45 sek · På knä Vid behov · Aktivering Mage, skuldror & framlår' where slug = 'postural-plank';
update public.exercises set sets_reps = '2 x 45 sek · Aktivering Mellan skulderbladen, bröst- & mittrygg' where slug = 'sitting-overhead-extension';
update public.exercises set sets_reps = '2 x 45 sek · Bröst- & ländrygg Rörlighet · Avslappning + mobilitet' where slug = 'static-dog-position';
update public.exercises set sets_reps = '2 x 45 sek · Stretch Mellan skulderbladen' where slug = 'wide-cobra';

-- "Stol" (chair) isn't really special equipment — align with the rest of the site
update public.exercises set equipment = 'Ingen utrustning' where slug = 'seated-trunk-rotation';
