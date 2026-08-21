import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrainingTips from "@/components/TrainingTips";
import { createClient } from "@/lib/supabase/server";
import OvningsbankClient from "./OvningsbankClient";
import styles from "./page.module.css";

export default async function OvningsbankPage() {
  const supabase = await createClient();

  const [{ data: exercises }, userResult] = await Promise.all([
    supabase
      .from("exercises")
      .select("id, slug, title, body_part, equipment, sets_reps")
      .order("body_part")
      .order("title"),
    supabase.auth.getUser(),
  ]);

  const user = userResult.data.user;

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
        <section style={{ paddingBottom: 0 }}>
          <span className="eyebrow">{exercises?.length ?? 0} övningar</span>
          <h1 className={styles.title}>Övningsbank</h1>
          <p className={styles.intro}>
            Varje övning för sig, filtrerbar på kroppsdel och utrustning.
            Spara favoriter direkt till Min sida.
          </p>
          <TrainingTips />
        </section>

        {(exercises ?? []).length === 0 ? (
          <p className={styles.empty}>
            Inga övningar hittades. Har seed-datan körts i Supabase (se{" "}
            <code>supabase/migrations/</code>)?
          </p>
        ) : (
          <OvningsbankClient
            exercises={exercises ?? []}
            favoriteIds={favoriteIds}
            loggedIn={!!user}
          />
        )}

        <Footer />
      </div>
    </>
  );
}
