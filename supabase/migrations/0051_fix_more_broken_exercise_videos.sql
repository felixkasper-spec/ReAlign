-- Samma problem som i föregående migration: video_url saknade Vimeos
-- säkerhets-hash (h=), vilket gjorde att övningarna inte gick att spela upp
-- för kunder. Korrekta länkar bekräftade av Felix.
-- OBS: "hand-leg-opposite-lifts-on-hands-and-knees" har samma problem men
-- saknar fortfarande en fungerande länk — fixas i en separat migration.

update public.exercises
set video_url = 'https://player.vimeo.com/video/1219636719?h=9d32edd932&title=0&byline=0&portrait=0'
where slug = 'chair-quad-stretch';

update public.exercises
set video_url = 'https://player.vimeo.com/video/1219631804?h=5b895422f2&title=0&byline=0&portrait=0'
where slug = 'flutter-kicks';

update public.exercises
set video_url = 'https://player.vimeo.com/video/1219572461?h=4fb188f512&title=0&byline=0&portrait=0'
where slug = 'static-dog-neck-retractions';
