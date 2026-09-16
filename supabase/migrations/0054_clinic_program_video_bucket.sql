-- Lagring för egeninspelade övningsvideor som coachen laddar upp direkt i
-- kundprogram-byggaren (t.ex. en modifierad övning för en specifik kund).
-- Publik bucket (till skillnad från coaching-journal, som är privat) eftersom
-- videorna länkas in i kundprogram-sidor som delas utan inloggning — samma
-- åtkomstnivå som en vanlig Vimeo-länk redan har. Ingen storage-policy för
-- skrivning: bara service-role-klienten (kundprogram-byggarens serverkod)
-- kan skapa signerade uppladdnings-URL:er.
insert into storage.buckets (id, name, public)
values ('clinic-program-videos', 'clinic-program-videos', true)
on conflict (id) do nothing;
