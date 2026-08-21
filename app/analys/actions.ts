"use server";

import { createClient } from "@/lib/supabase/server";
import { buildRecommendation, type QuizAnswers } from "@/lib/personalize";

export type ResolvedStep = {
  slug: string;
  title: string;
  tier: "free" | "premium";
  note: string;
};

export type ResolvedRecommendation = {
  headline: string;
  comboNote: string | null;
  progressionNote: string | null;
  steps: ResolvedStep[];
};

export async function getRecommendation(
  answers: QuizAnswers,
): Promise<ResolvedRecommendation> {
  const recommendation = buildRecommendation(answers);
  const supabase = await createClient();

  const slugs = [...new Set(recommendation.steps.map((s) => s.programSlug))];
  const { data: programs } = await supabase
    .from("programs")
    .select("slug, title, tier")
    .in("slug", slugs);

  const bySlug = new Map((programs ?? []).map((p) => [p.slug, p]));

  return {
    headline: recommendation.headline,
    comboNote: recommendation.comboNote,
    progressionNote: recommendation.progressionNote,
    steps: recommendation.steps.map((step) => {
      const program = bySlug.get(step.programSlug);
      return {
        slug: step.programSlug,
        title: program?.title ?? step.programSlug,
        tier: (program?.tier as "free" | "premium") ?? "free",
        note: step.note,
      };
    }),
  };
}
