-- Byt namn på Gymträning-programmen till "Postural Gymträning", och
-- uppdatera introduktionsmeningen för underkropp och överkropp.

update public.programs
set title = 'Postural Gymträning - Underkropp'
where slug = 'gym-underkropp';

update public.programs
set title = 'Postural Gymträning - Överkropp'
where slug = 'gym-overkropp';

update public.programs
set title = 'Postural Gymträning - Helkropp'
where slug = 'gym-helkropp';

update public.programs
set description = 'Rörelser du kanske redan känner igen, fast med fokus på just de detaljer som gör dem posturalt stärkande.'
where slug in ('gym-underkropp', 'gym-overkropp');
