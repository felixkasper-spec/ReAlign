import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * En övning är Premium-låst om den bara förekommer i premium-program —
 * förekommer den i minst ett gratisprogram förblir den fri. Härlett från
 * program_exercises + programs.tier istället för en egen tier-kolumn på
 * exercises, samma mönster som lib/exercise-categories.ts.
 *
 * Fristående övningar (inget program alls) har ingen programtillhörighet
 * att härleda ifrån, så de styrs istället av exercises.is_premium direkt —
 * satt explicit av den flaggan oavsett programtillhörighet.
 */
export async function getPremiumExerciseSlugs(): Promise<Set<string>> {
  const supabase = await createClient();

  const [{ data: rows }, { data: flagged }] = await Promise.all([
    supabase.from("program_exercises").select("exercises ( slug ), programs ( tier )"),
    supabase.from("exercises").select("slug").eq("is_premium", true),
  ]);

  const seenFree = new Set<string>();
  const seenPremium = new Set<string>();

  for (const row of rows ?? []) {
    const slug = (row.exercises as unknown as { slug: string } | null)?.slug;
    const tier = (row.programs as unknown as { tier: string } | null)?.tier;
    if (!slug) continue;
    if (tier === "free") {
      seenFree.add(slug);
    } else if (tier === "premium") {
      seenPremium.add(slug);
    }
  }

  const locked = new Set<string>();
  for (const slug of seenPremium) {
    if (!seenFree.has(slug)) locked.add(slug);
  }
  for (const row of flagged ?? []) {
    locked.add(row.slug);
  }
  return locked;
}
