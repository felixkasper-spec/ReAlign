-- Seed: de 16 programmen från prototypen (prototype/hallning-program-*.html).
-- tier/level följer briefingens kontostruktur: Helkropp Nivå 1-2, Höfter/
-- Axlar Nivå 1, Bålträning och Kontorsvardag är gratis; resten Premium.
insert into public.programs (slug, title, category, tier, level, description) values
  ('helkropp-niva-1', 'Helkropp - Nivå 1', 'helkropp', 'free', 1, null),
  ('helkropp-niva-2', 'Helkropp - Nivå 2', 'helkropp', 'free', 2, null),
  ('helkropp-niva-3', 'Helkropp - Nivå 3', 'helkropp', 'premium', 3, null),
  ('helkropp-niva-4', 'Helkropp - Nivå 4', 'helkropp', 'premium', 4, null),
  ('helkropp-niva-5', 'Helkropp - Nivå 5', 'helkropp', 'premium', 5, null),
  ('hofter-niva-1', 'Höft & bäcken - Nivå 1', 'hofter', 'free', 1, null),
  ('hofter-niva-2', 'Höft & bäcken - Nivå 2', 'hofter', 'premium', 2, null),
  ('hofter-niva-3', 'Höft & bäcken - Nivå 3', 'hofter', 'premium', 3, null),
  ('axlar-nacke-skulderblad-niva-1', 'Axlar/nacke/skulderblad - Nivå 1', 'axlar-nacke-skulderblad', 'free', 1, null),
  ('axlar-nacke-skulderblad-niva-2', 'Axlar/nacke/skulderblad - Nivå 2', 'axlar-nacke-skulderblad', 'premium', 2, null),
  ('axlar-nacke-skulderblad-niva-3', 'Axlar/nacke/skulderblad - Nivå 3', 'axlar-nacke-skulderblad', 'premium', 3, null),
  ('gym-underkropp', 'Gymträning - Underkropp', 'gym', 'premium', null, null),
  ('gym-overkropp', 'Gymträning - Överkropp', 'gym', 'premium', null, null),
  ('gym-helkropp', 'Gymträning - Helkropp', 'gym', 'premium', null, null),
  ('baltraning', 'Bålträning', 'bal', 'free', null, null),
  ('kontorsvardag', 'Kontorsvardag', 'kontorsvardag', 'free', null, null);
