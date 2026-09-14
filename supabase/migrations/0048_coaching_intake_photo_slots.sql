-- Byt fri uppladdning av 2-3 hållningsfoton mot fyra tydliga,
-- namngivna vinklar (framifrån, bakifrån, vänster sida, höger sida),
-- i linje med formuläret på kliniken.
alter table public.coaching_intake
  add column photo_front_path text,
  add column photo_back_path text,
  add column photo_left_path text,
  add column photo_right_path text;

alter table public.coaching_intake drop column photo_paths;
