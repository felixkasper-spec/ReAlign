-- video_url saknade Vimeos säkerhets-hash (h=), vilket gjorde att videon
-- inte gick att spela upp för kunder (Vimeo svarar 404 på embed-URL:er utan
-- hash för icke-publika videor). Korrekt länk bekräftad av Felix.
update public.exercises
set video_url = 'https://player.vimeo.com/video/1219635070?h=20387fc3b2&title=0&byline=0&portrait=0'
where slug = 'static-back-pullover-presses';
