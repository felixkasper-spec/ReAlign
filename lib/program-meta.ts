// Kompletterande metadata som inte finns i databasschemat (vecko-/
// frekvensuppgifter från prototypens programkort). Portat 1:1.
export const programMeta: Record<
  string,
  { level: string; weeks: string; freq: string; purpose: string }
> = {
  "helkropp-niva-1": { level: "Nybörjare", weeks: "3 veckor", freq: "3-5x/vecka", purpose: "Helkropp" },
  "helkropp-niva-2": { level: "Nybörjare", weeks: "3 veckor", freq: "3-5x/vecka", purpose: "Helkropp" },
  "helkropp-niva-3": { level: "Medel", weeks: "2 veckor", freq: "4x/vecka", purpose: "Helkropp" },
  "helkropp-niva-4": { level: "Medel", weeks: "2 veckor", freq: "4x/vecka", purpose: "Helkropp" },
  "helkropp-niva-5": { level: "Avancerad", weeks: "2 veckor", freq: "4x/vecka", purpose: "Helkropp" },
  "hofter-niva-1": { level: "Nybörjare", weeks: "Engångspass", freq: "7 övningar", purpose: "Höft & ländrygg" },
  "hofter-niva-2": { level: "Nybörjare", weeks: "Engångspass", freq: "6 övningar", purpose: "Höft & ländrygg" },
  "hofter-niva-3": { level: "Medel", weeks: "Engångspass", freq: "5 övningar", purpose: "Höft & ländrygg" },
  "axlar-nacke-skulderblad-niva-1": { level: "Nybörjare", weeks: "Engångspass", freq: "8 övningar", purpose: "Axlar/nacke/skulderblad" },
  "axlar-nacke-skulderblad-niva-2": { level: "Nybörjare", weeks: "Engångspass", freq: "7 övningar", purpose: "Axlar/nacke/skulderblad" },
  "axlar-nacke-skulderblad-niva-3": { level: "Medel", weeks: "Engångspass", freq: "6 övningar", purpose: "Axlar/nacke/skulderblad" },
  "rorlighet-hofter-landrygg": { level: "Alla nivåer", weeks: "Engångspass", freq: "6 övningar", purpose: "Rörlighet höft & ländrygg" },
  "rorlighet-axlar-skulderblad-nacke": { level: "Alla nivåer", weeks: "Engångspass", freq: "7 övningar", purpose: "Rörlighet axlar/nacke" },
  "rorlighet-helkropp": { level: "Alla nivåer", weeks: "Engångspass", freq: "11 övningar", purpose: "Rörlighet helkropp" },
  "rorlighet-under-belastning": { level: "Alla nivåer", weeks: "Engångspass", freq: "7 övningar", purpose: "Rörlighet under belastning" },
  "knafokus-mjukt": { level: "Nybörjare", weeks: "Engångspass", freq: "8 övningar", purpose: "Knäfokus" },
  "knafokus-avancerad": { level: "Avancerad", weeks: "Engångspass", freq: "7 övningar", purpose: "Knäfokus" },
  "vacka-satet-mjukt": { level: "Nybörjare", weeks: "Engångspass", freq: "7 övningar", purpose: "Väcka sätet" },
  "vacka-satet-avancerat": { level: "Avancerad", weeks: "Engångspass", freq: "7 övningar", purpose: "Väcka sätet" },
  baltraning: { level: "Nybörjare", weeks: "Engångspass", freq: "6 övningar", purpose: "Bålträning" },
  kontorsvardag: { level: "Nybörjare", weeks: "Engångspass", freq: "5 övningar", purpose: "Kontorsvardag" },
  "gym-underkropp": { level: "Medel", weeks: "Engångspass", freq: "6 övningar", purpose: "Postural Gymträning" },
  "gym-overkropp": { level: "Medel", weeks: "Engångspass", freq: "7 övningar", purpose: "Postural Gymträning" },
  "gym-helkropp": { level: "Medel", weeks: "Engångspass", freq: "7 övningar", purpose: "Postural Gymträning" },
};
