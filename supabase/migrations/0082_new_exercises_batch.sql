-- Ny batch övningar från Felix (filmade i samma Vimeo-uppladdning). Samma
-- innehåll som motsvarande migration på Cleer Klinik-sidan
-- (0050_new_exercises_batch.sql). Inga instruktioner/tips skrivna, samma
-- lättviktsmönster som migration 0074/0075/0076. Kategorisering (body_part)
-- är bästa gissning utifrån namnet — justera gärna vid tillfälle.
--
-- "Wide Cobra Wall" finns redan sedan tidigare (migration 0074/0075) — den
-- raden byter bara ut videon (och titeln, från "Wide Cobra - Vägg" till
-- "Wide Cobra Wall" som Felix nu kallar den) via upsert på slug, body_part
-- behålls som 'Rygg' och equipment ('Vägg') rörs inte alls eftersom den
-- kolumnen inte är med i detta upsert. "Standing Pullover Presses" finns
-- inte sedan tidigare här (bara på Cleer-sidan) så den blir en helt ny rad.
-- Övriga nio är helt nya övningar.
insert into public.exercises (slug, title, body_part, video_url, sets_reps)
values
  (
    'sitting-scapula-stretch',
    'Sitting Scapula Stretch',
    'Nacke & axlar & skulderblad',
    'https://player.vimeo.com/video/1236803805?h=b401176b6f&title=0&byline=0&portrait=0',
    '2 x 1 min per sida'
  ),
  (
    'standing-arm-circles-laga-armar',
    'Standing Arm Circles - Låga Armar',
    'Nacke & axlar & skulderblad',
    'https://player.vimeo.com/video/1236803772?h=df01bae2fa&title=0&byline=0&portrait=0',
    '2 x 30 cirklar'
  ),
  (
    'sitting-lower-back-stretch',
    'Sitting Lower Back Stretch',
    'Rygg',
    'https://player.vimeo.com/video/1236803333?h=47755aa25b&title=0&byline=0&portrait=0',
    '2 x 1 min'
  ),
  (
    'wide-cobra-vagg',
    'Wide Cobra Wall',
    'Rygg',
    'https://player.vimeo.com/video/1236803332?h=400647d2bf&title=0&byline=0&portrait=0',
    '2 x 1 min'
  ),
  (
    'nackmassage',
    'Nackmassage',
    'Nacke & axlar & skulderblad',
    'https://player.vimeo.com/video/1236803334?h=0dc3e007e9&title=0&byline=0&portrait=0',
    '3-5 min per sida'
  ),
  (
    'standing-hip-lifts',
    'Standing Hip Lifts',
    'Höft & bäcken',
    'https://player.vimeo.com/video/1236801090?h=e3be1c5a26&title=0&byline=0&portrait=0',
    '2 x 30 sek per ben'
  ),
  (
    'standing-foot-squeezes',
    'Standing Foot Squeezes',
    'Ben & fötter',
    'https://player.vimeo.com/video/1236801089?h=83a31991f5&title=0&byline=0&portrait=0',
    '2 x 10'
  ),
  (
    'standing-delta-stretch',
    'Standing Delta Stretch',
    'Nacke & axlar & skulderblad',
    'https://player.vimeo.com/video/1236800751?h=b594cdffc5&title=0&byline=0&portrait=0',
    '2 x 45 sek per sida'
  ),
  (
    'sitting-knee-squeezes-band-pull',
    'Sitting Knee Squeezes - Band Pull',
    'Höft & bäcken',
    'https://player.vimeo.com/video/1236800749?h=0bf35f9a6f&title=0&byline=0&portrait=0',
    '2 x 10'
  ),
  (
    'sitting-hamstring-stretch',
    'Sitting Hamstring Stretch',
    'Höft & bäcken',
    'https://player.vimeo.com/video/1236800750?h=4a308f5109&title=0&byline=0&portrait=0',
    '2 x 45 sek per sida'
  ),
  (
    'standing-pullover-presses',
    'Standing Pullover Presses',
    'Nacke & axlar & skulderblad',
    'https://player.vimeo.com/video/1236801087?h=e6f200689f&title=0&byline=0&portrait=0',
    '2 x 10'
  ),
  (
    'static-back-knee-squeezes-goal-post-presses',
    'Static Back Knee Squeezes - Goal Post Presses',
    'Nacke & axlar & skulderblad',
    'https://player.vimeo.com/video/1236800752?h=2dd38473f3&title=0&byline=0&portrait=0',
    '2 x 10'
  )
on conflict (slug) do update set
  title = excluded.title,
  body_part = excluded.body_part,
  video_url = excluded.video_url,
  sets_reps = excluded.sets_reps;
