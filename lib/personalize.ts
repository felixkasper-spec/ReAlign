export type PainArea = "nacke" | "rygg" | "hoft" | "helkropp" | "annat";
export type Lifestyle = "stillasittande" | "aktiv" | "blandat";
export type Experience = "ny" | "bekvam" | "erfaren";
export type Equipment = "ingen" | "hemma" | "gym";
export type TimePreference = "kort" | "medel" | "fullt";

export type QuizAnswers = {
  pain: PainArea;
  lifestyle: Lifestyle;
  experience: Experience;
  equipment: Equipment;
  time: TimePreference;
};

export type RecommendationStep = {
  programSlug: string;
  note: string;
};

export type Recommendation = {
  headline: string;
  comboNote: string | null;
  progressionNote: string | null;
  steps: RecommendationStep[];
};

type Category = {
  name: string;
  prefix: "helkropp" | "hofter" | "axlar-nacke-skulderblad";
  maxLevel: number;
};

function categoryFor(pain: PainArea): Category {
  if (pain === "nacke") {
    return { name: "Axlar/nacke/skulderblad", prefix: "axlar-nacke-skulderblad", maxLevel: 3 };
  }
  if (pain === "hoft") {
    return { name: "Höft & ländrygg", prefix: "hofter", maxLevel: 3 };
  }
  // "rygg", "helkropp" (helheten) och "annat" hanteras alla som Helkropp —
  // det finns ingen egen Rygg-kategori (se briefing).
  return { name: "Helkropp", prefix: "helkropp", maxLevel: 5 };
}

function levelFor(experience: Experience, maxLevel: number) {
  let level = 1;
  let note = "";
  if (experience === "bekvam") level = 2;
  if (experience === "erfaren") {
    level = 2;
    note = "Kör Nivå 2 minst 10 tillfällen innan du går vidare till nästa nivå.";
  }
  return { level: Math.min(level, maxLevel), note };
}

/**
 * Portering av regellogiken från prototypens hallning-personaliserat.html
 * till en backend-funktion. Returnerar programslugs (inte färdig text) så
 * att anroparen kan slå upp riktiga titlar/tier mot programs-tabellen.
 */
export function buildRecommendation(answers: QuizAnswers): Recommendation {
  const cat = categoryFor(answers.pain);
  const lvl = levelFor(answers.experience, cat.maxLevel);
  const catSlug = `${cat.prefix}-niva-${lvl.level}`;
  const catTitle = `${cat.name} - Nivå ${lvl.level}`;

  const progressionNote = lvl.note.trim() || null;

  if (answers.equipment === "gym") {
    const gymSlug =
      answers.pain === "nacke"
        ? "gym-overkropp"
        : answers.pain === "hoft"
          ? "gym-underkropp"
          : "gym-helkropp";
    const gymTitle =
      gymSlug === "gym-overkropp"
        ? "Gymträning - Överkropp"
        : gymSlug === "gym-underkropp"
          ? "Gymträning - Underkropp"
          : "Gymträning - Helkropp";

    return {
      headline: "Kombinera gym med postural grundträning",
      comboNote:
        "I början mår kroppen mycket bra av att jobba mer fokuserat på hållningsmusklerna, därför föreslår vi att du kombinerar gymträningen med mer specifika övningar.",
      progressionNote,
      steps: [
        { programSlug: gymSlug, note: `${gymTitle} — rekommenderas 2 gånger i veckan.` },
        {
          programSlug: catSlug,
          note: `${catTitle} — rekommenderas 2–3 gånger i veckan, som grundträning parallellt.`,
        },
        {
          programSlug: catSlug,
          note: `Efter 2–3 veckor: byt ut föregående steg mot nästa nivå i samma kategori, fortsatt i kombination med ${gymTitle}.`,
        },
      ],
    };
  }

  const steps: RecommendationStep[] = [
    { programSlug: catSlug, note: `${catTitle} — ditt huvudsakliga fokusprogram.` },
  ];

  const isCombo = cat.prefix !== "helkropp";
  if (isCombo) {
    steps.push({
      programSlug: "helkropp-niva-1",
      note: "Helkropp - Nivå 1 — som komplement, varannan träningsdag.",
    });
  }

  if (answers.lifestyle === "stillasittande") {
    steps.push({
      programSlug: "kontorsvardag",
      note: "Kontorsvardag — rekommenderas några gånger i veckan som ett kort tillägg, perfekt vid skrivbordet.",
    });
  }

  return {
    headline: catTitle,
    comboNote: isCombo
      ? "Ett riktat program löser sällan hela problemet på egen hand — kroppen hänger ihop. Därför föreslår vi att du kombinerar med ett kort helkroppspass, så att helheten inte glöms bort."
      : null,
    progressionNote,
    steps,
  };
}
