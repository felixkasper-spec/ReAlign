-- Sista av de 5 trasiga övningsvideorna. Denna hade privacy satt till
-- "Private" (bara inbjudna kan se) istället för "Only people with the
-- private link", vilket gjorde att inget delningslänk-alternativ alls
-- fanns förrän Felix bytte inställningen. Korrekt länk bekräftad av Felix.
update public.exercises
set video_url = 'https://player.vimeo.com/video/1219570438?h=fead4fc36b&title=0&byline=0&portrait=0'
where slug = 'hand-leg-opposite-lifts-on-hands-and-knees';
