import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrainingTips from "@/components/TrainingTips";
import { createClient } from "@/lib/supabase/server";
import { getExerciseCategories } from "@/lib/exercise-categories";
import { getPremiumExerciseSlugs } from "@/lib/exercise-tier";
import { pageMetadata } from "@/lib/page-metadata";
import OvningsbankClient from "./OvningsbankClient";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Övningsbank — ReAlign Metoden",
  description:
    "Bläddra bland alla övningar med instruktionsvideo — sök på kroppsdel, utrustning eller programnivå.",
  image: "/og/ovningsbank.png",
});

export default async function OvningsbankPage() {
  const supabase = await createClient();

  const [{ data: exercises }, userResult, { data: helkroppPrograms }, premiumSlugs] =
    await Promise.all([
      supabase
        .from("exercises")
        .select("id, slug, title, body_part, equipment, sets_reps")
        .order("body_part")
        .order("title"),
      supabase.auth.getUser(),
      supabase
        .from("programs")
        .select(
          "id, program_exercises ( order_index, exercises ( slug ) )",
        )
        .in("slug", ["helkropp-niva-1", "helkropp-niva-2", "helkropp-niva-3"]),
      getPremiumExerciseSlugs(),
    ]);

  const user = userResult.data.user;

  // Övningar som ingår i Helkropp Nivå 1-3 lyfts högst upp i listan — det
  // är övningarna flest nya besökare möter först via programmen, till
  // skillnad från kroppsdelen "Helkropp" som råkar sortera alfabetiskt
  // överst men mest innehåller redan välkända rörelser.
  const priorityRank = new Map<string, number>();
  for (const program of helkroppPrograms ?? []) {
    const rows = (program.program_exercises ?? []) as unknown as {
      order_index: number;
      exercises: { slug: string } | null;
    }[];
    for (const row of rows.sort((a, b) => a.order_index - b.order_index)) {
      const slug = row.exercises?.slug;
      if (slug && !priorityRank.has(slug)) {
        priorityRank.set(slug, priorityRank.size);
      }
    }
  }

  const sortedExercises = [...(exercises ?? [])]
    .sort((a, b) => {
      const rankA = priorityRank.get(a.slug) ?? Infinity;
      const rankB = priorityRank.get(b.slug) ?? Infinity;
      return rankA - rankB;
    })
    .map((e) => ({
      ...e,
      categories: getExerciseCategories(e.slug, e.body_part),
      premium: premiumSlugs.has(e.slug),
    }));

  let favoriteIds: string[] = [];
  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("exercise_id")
      .eq("user_id", user.id);
    favoriteIds = (favorites ?? []).map((f) => f.exercise_id);
  }

  return (
    <>
      <Header />
      <div className="wrap">
        <div className={styles.pageHead}>
          <span className="eyebrow">{exercises?.length ?? 0} övningar</span>
          <h1 className={styles.title}>Övningsbank</h1>
          <p className={styles.intro}>
            Varje övning för sig, filtrerbar på kroppsdel och utrustning.
            Spara favoriter direkt till Min sida.
          </p>
          <TrainingTips />
          <Link
            href="#ovningslista"
            className={`btn btn-ghost ${styles.jumpBtn}`}
            style={{ border: "1px solid var(--line)" }}
          >
            Till övningarna →
          </Link>
        </div>

        {sortedExercises.length === 0 ? (
          <p className={styles.empty}>
            Inga övningar hittades. Har seed-datan körts i Supabase (se{" "}
            <code>supabase/migrations/</code>)?
          </p>
        ) : (
          <OvningsbankClient
            exercises={sortedExercises}
            favoriteIds={favoriteIds}
            loggedIn={!!user}
          />
        )}

        <Footer />
      </div>
    </>
  );
}
