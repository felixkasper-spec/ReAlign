-- Bytte ut länken från migration 0074 mot en ny Vimeo-uppladdning.
update public.exercises
set video_url = 'https://player.vimeo.com/video/1229502256?h=efbe299523&title=0&byline=0&portrait=0'
where slug = 'wide-cobra-vagg';
