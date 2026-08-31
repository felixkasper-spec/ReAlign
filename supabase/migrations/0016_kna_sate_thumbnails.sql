-- Thumbnails för de fyra nya Knäfokus/Väcka sätet-programmen.

update public.programs set hero_image = '/exercises/inner-thigh-lifts.jpg'
where slug = 'knafokus-mjukt';

update public.programs set hero_image = '/exercises/lateral-lunges-wall.jpg'
where slug = 'knafokus-avancerad';

update public.programs set hero_image = '/exercises/active-cobra.jpg'
where slug = 'vacka-satet-mjukt';

update public.programs set hero_image = '/exercises/romanian-deadlift-single-leg.jpg'
where slug = 'vacka-satet-avancerat';
