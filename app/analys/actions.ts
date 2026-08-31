"use server";

import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { buildRecommendation, type QuizAnswers } from "@/lib/personalize";

export type ResolvedStep = {
  slug: string;
  title: string;
  tier: "free" | "premium";
  note: string;
};

export type ClosestFreeProgram = {
  slug: string;
  title: string;
};

export type ResolvedRecommendation = {
  headline: string;
  comboNote: string | null;
  progressionNote: string | null;
  timeNote: string | null;
  steps: ResolvedStep[];
  viewerIsPremium: boolean;
  closestFree: ClosestFreeProgram | null;
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

  let closestFree: ClosestFreeProgram | null = null;
  if (!viewerIsPremium && hasPremiumStep) {
    if (recommendation.closestFreeOverride) {
      const { data } = await supabase
        .from("programs")
        .select("slug, title")
        .eq("slug", recommendation.closestFreeOverride)
        .maybeSingle();
      if (data) closestFree = data;
    } else if (recommendation.category) {
      const { data } = await supabase
        .from("programs")
        .select("slug, title")
        .eq("category", recommendation.category.prefix)
        .eq("tier", "free")
        .order("level", { ascending: false })
        .limit(1);
      if (data && data[0]) closestFree = data[0];
    }
  }

  return {
    headline: recommendation.headline,
    comboNote: recommendation.comboNote,
    progressionNote: recommendation.progressionNote,
    timeNote: recommendation.timeNote,
    steps,
    viewerIsPremium,
    closestFree,
  };
}
