export type PainArea = "nacke" | "rygg" | "hoft" | "helkropp" | "kna" | "annat";
export type Lifestyle = "stillasittande" | "aktiv" | "blandat";
export type Experience = "ny" | "bekvam" | "erfaren";
export type Equipment = "gym" | "inte-gym";
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
  timeNote: string | null;
  steps: RecommendationStep[];
  // Kategori-prefix att slå upp gratis-alternativ mot (om huvudrekommendationen
  // är Premium). null när closestFreeOverride ska användas istället.
  category: { prefix: string } | null;
  // Hårdkodad gratis-fallback för fall där kategorin själv saknar gratisnivå
  // (t.ex. knäprogrammen, som är rena Premium-program).
  closestFreeOverride: string | null;
};

type Category = {
  name: string;
  prefix: "helkropp" | "hofter" | "axlar-nacke-skulderblad";
  // Tak för vad quizet rekommenderar som startnivå.
  maxLevel: number;
  // Högsta nivå som faktiskt finns i databasen för kategorin — används för
  // att avgöra om progressionstexten ska peka på en "nästa nivå" eller inte.
  realMaxLevel: number;
};

function categoryFor(pain: PainArea): Category {
  if (pain === "nacke") {
    return {
      name: "Axlar/nacke/skulderblad",
      prefix: "axlar-nacke-skulderblad",
      maxLevel: 2,
      realMaxLevel: 3,
    };
  }
  if (pain === "hoft") {
    return { name: "Höft & ländrygg", prefix: "hofter", maxLevel: 2, realMaxLevel: 3 };
  }
  // "rygg", "helkropp" (helheten) och "annat" hanteras alla som Helkropp —
  // det finns ingen egen Rygg-kategori (se briefing).
  return { name: "Helkropp", prefix: "helkropp", maxLevel: 5, realMaxLevel: 5 };
}

function baseLevel(experience: Experience) {
  if (experience === "erfaren") return 3;
  if (experience === "bekvam") return 2;
  return 1;
}

function progressionNoteFor(categoryName: string, level: number, realMaxLevel: number) {
  const nextLevel = level + 1;
  if (nextLevel > realMaxLevel) return null;
  return `Efter minst 10 pass, och när du känner att du har bra koll på tekniken, du får kontakt där övningen ska kännas, och att det börjar bli lätt att göra angivet antal repetitioner, testa att gå vidare till ${categoryName} - Nivå ${nextLevel}.`;
}

function timeNoteFor(time: TimePreference) {
  return time === "kort"
    ? "Alla program du rekommenderas har en kort variant, kom ihåg att välja längd som passar in i din vardag."
    : null;
}

function gymAddonFor(pain: PainArea) {
  const gymSlug =
    pain === "nacke" ? "gym-overkropp" : pain === "hoft" ? "gym-underkropp" : "gym-helkropp";
  const gymTitle =
    gymSlug === "gym-overkropp"
      ? "Postural Gymträning - Överkropp"
      : gymSlug === "gym-underkropp"
        ? "Postural Gymträning - Underkropp"
        : "Postural Gymträning - Helkropp";
  return { gymSlug, gymTitle };
}

function buildKneeRecommendation(answers: QuizAnswers): Recommendation {
  const helkroppLevel = Math.min(baseLevel(answers.experience), 5);
  const helkroppSlug = `helkropp-niva-${helkroppLevel}`;
  const helkroppTitle = `Helkropp - Nivå ${helkroppLevel}`;

  return {
    headline: "Knäfokus",
    comboNote:
      "Ett riktat program för knäna löser sällan hela problemet på egen hand — kroppen hänger ihop. Därför föreslår vi att du kombinerar med ett helkroppsprogram, så att helheten inte glöms bort.",
    progressionNote: progressionNoteFor("Helkropp", helkroppLevel, 5),
    timeNote: timeNoteFor(answers.time),
    steps: [
      { programSlug: helkroppSlug, note: `${helkroppTitle} — som grundträning för hela kroppen.` },
      {
        programSlug: "knafokus-mjukt",
        note: "Knäfokus - Mjukt — riktat mot knäproblematik, funktion, stabilitet och styrka.",
      },
    ],
    category: null,
    closestFreeOverride: "hofter-niva-1",
  };
}

/**
 * Portering av regellogiken från prototypens hallning-personaliserat.html
 * till en backend-funktion. Returnerar programslugs (inte färdig text) så
 * att anroparen kan slå upp riktiga titlar/tier mot programs-tabellen.
 */
export function buildRecommendation(answers: QuizAnswers): Recommendation {
  if (answers.pain === "kna") {
    return buildKneeRecommendation(answers);
  }

  const cat = categoryFor(answers.pain);
  const level = Math.min(baseLevel(answers.experience), cat.maxLevel);
  const catSlug = `${cat.prefix}-niva-${level}`;
  const catTitle = `${cat.name} - Nivå ${level}`;

  const progressionNote = progressionNoteFor(cat.name, level, cat.realMaxLevel);
  const timeNote = timeNoteFor(answers.time);

  // Gym rekommenderas bara som tillägg när alla tre stämmer: erfaren,
  // redan aktiv, och har tillgång till gym. För alla andra ligger fokus
  // strikt på det posturala — vi rekommenderar aldrig att börja med gym.
  const wantsGymAddon =
    answers.equipment === "gym" && answers.experience === "erfaren" && answers.lifestyle === "aktiv";

  if (wantsGymAddon) {
    const { gymSlug, gymTitle } = gymAddonFor(answers.pain);

    return {
      headline: catTitle,
      comboNote:
        "Fokus ligger på det strikt posturala — gymträningen är ett komplement du kan integrera i din befintliga gymrutin, inte tvärtom.",
      progressionNote,
      timeNote,
      steps: [
        { programSlug: catSlug, note: `${catTitle} — ditt huvudsakliga fokusprogram.` },
        {
          programSlug: gymSlug,
          note: `${gymTitle} — förslag att integrera i din gymrutin, 2 gånger i veckan.`,
        },
      ],
      category: { prefix: cat.prefix },
      closestFreeOverride: null,
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
    timeNote,
    steps,
    category: { prefix: cat.prefix },
    closestFreeOverride: null,
  };
}
