import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrainingTips from "@/components/TrainingTips";
import { createClient } from "@/lib/supabase/server";
import { getExerciseCategories } from "@/lib/exercise-categories";
import { getPremiumExerciseSlugs } from "@/lib/exercise-tier";
import { getSubscription } from "@/lib/subscription";
import { pageMetadata } from "@/lib/page-metadata";
import OvningsbankClient from "./OvningsbankClient";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Övningsbank — ReAlign Metoden",
  description:
    "Bläddra bland alla övningar med instruktionsvideo — sök på kroppsdel, utrustning eller programnivå.",
  image: "/og/ovningsbank.png",
  path: "/ovningsbank",
});

export default async function OvningsbankPage() {
  const supabase = await createClient();
  const subscription = await getSubscription();

  if (!subscription.active) {
    return (
      <>
        <Header />
        <div className="wrap">
          <div className={styles.pageHead}>
            <span className="eyebrow">Övningsbank</span>
            <h1 className={styles.title}>Övningsbank</h1>
            <p className={styles.intro}>
              Bläddra bland alla övningar, sök på kroppsdel eller
              utrustning, och kombinera dina favoriter till ett eget
              program.
            </p>
          </div>
          <div className={styles.lockedBox}>
            <span className="eyebrow" style={{ color: "var(--warm)" }}>
              Premium
            </span>
            <h3 style={{ fontSize: "1.2rem", margin: "10px 0 8px", fontWeight: 500 }}>
              Övningsbanken ingår i Premium
            </h3>
            <p style={{ color: "var(--text)", fontSize: "0.92rem", marginBottom: 18 }}>
              Tillsammans med alla programnivåer, progressionsspårning
              och verktygen för att faktiskt hålla i det — 149 kr/mån,
              eller 1 341 kr/år (spara 25%).
            </p>
            <Link className="btn btn-primary" href="/premium">
              Läs mer om Premium →
            </Link>
            <p style={{ color: "var(--sage)", fontSize: "0.78rem", marginTop: 10 }}>
              ✓ Går att betala med friskvårdsbidrag
            </p>
          </div>
          <Footer />
        </div>
      </>
    );
  }

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

        <div className={styles.banner}>
          <p>Spara övningar som favoriter och kombinera dem till ett eget, ordnat program.</p>
          <Link
            className="btn btn-primary"
            href="/min-sida/bygg-program"
            style={{ whiteSpace: "nowrap" }}
          >
            Bygg eget program →
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
            hasPremiumAccess={subscription.active}
          />
        )}

        <Footer />
      </div>
    </>
  );
}
