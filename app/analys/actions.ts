"use server";

import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { programMeta } from "@/lib/program-meta";
import { buildRecommendation, type QuizAnswers } from "@/lib/personalize";

export type ResolvedStep = {
  slug: string;
  title: string;
  tier: "free" | "premium";
  note: string;
};

export type FreeProgram = {
  slug: string;
  title: string;
  purpose: string;
};

export type ResolvedRecommendation = {
  headline: string;
  comboNote: string | null;
  progressionNote: string | null;
  steps: ResolvedStep[];
  viewerIsPremium: boolean;
  freePrograms: FreeProgram[];
};

export async function getRecommendation(
  answers: QuizAnswers,
): Promise<ResolvedRecommendation> {
  const recommendation = buildRecommendation(answers);
  const supabase = await createClient();

  const slugs = [...new Set(recommendation.steps.map((s) => s.programSlug))];
  const [{ data: programs }, subscription] = await Promise.all([
    supabase.from("programs").select("slug, title, tier").in("slug", slugs),
    getSubscription(),
  ]);

  const bySlug = new Map((programs ?? []).map((p) => [p.slug, p]));

  const steps = recommendation.steps.map((step) => {
    const program = bySlug.get(step.programSlug);
    return {
      slug: step.programSlug,
      title: program?.title ?? step.programSlug,
      tier: (program?.tier as "free" | "premium") ?? "free",
      note: step.note,
    };
  });

  const viewerIsPremium = subscription.active;
  const hasPremiumStep = steps.some((s) => s.tier === "premium");

  let freePrograms: FreeProgram[] = [];
  if (!viewerIsPremium && hasPremiumStep) {
    const { data: freeData } = await supabase
      .from("programs")
      .select("slug, title")
      .eq("tier", "free");
    freePrograms = (freeData ?? [])
      .map((p) => ({
        slug: p.slug as string,
        title: p.title as string,
        purpose: programMeta[p.slug]?.purpose ?? "",
      }))
      .filter((p) => !steps.some((s) => s.slug === p.slug));
  }

  return {
    headline: recommendation.headline,
    comboNote: recommendation.comboNote,
    progressionNote: recommendation.progressionNote,
    steps,
    viewerIsPremium,
    freePrograms,
  };
}
