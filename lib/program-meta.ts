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
  baltraning: { level: "Nybörjare", weeks: "Engångspass", freq: "6 övningar", purpose: "Bålträning" },
  kontorsvardag: { level: "Nybörjare", weeks: "Engångspass", freq: "5 övningar", purpose: "Kontorsvardag" },
  "gym-underkropp": { level: "Medel", weeks: "Engångspass", freq: "6 övningar", purpose: "Gymträning" },
  "gym-overkropp": { level: "Medel", weeks: "Engångspass", freq: "7 övningar", purpose: "Gymträning" },
  "gym-helkropp": { level: "Medel", weeks: "Engångspass", freq: "7 övningar", purpose: "Gymträning" },
};
