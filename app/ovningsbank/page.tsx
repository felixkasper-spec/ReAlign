import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

type Exercise = {
  id: string;
  slug: string;
  title: string;
  body_part: string;
  equipment: string | null;
  sets_reps: string | null;
};

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

  let favoriteIds = new Set<string>();
  if (user) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("exercise_id")
      .eq("user_id", user.id);
    favoriteIds = new Set((favorites ?? []).map((f) => f.exercise_id));
  }

  const groups = new Map<string, Exercise[]>();
  for (const exercise of exercises ?? []) {
    const list = groups.get(exercise.body_part) ?? [];
    list.push(exercise);
    groups.set(exercise.body_part, list);
  }

  return (
    <>
      <Header />
      <div className="wrap">
        <section style={{ paddingBottom: 20 }}>
          <span className="eyebrow">Övningsbank</span>
          <h1 className={styles.title}>Alla övningar, fritt tillgängliga.</h1>
          <p className={styles.intro}>
            {exercises?.length ?? 0} övningar, filtrerade på kroppsdel.
            Logga in för att spara favoriter.
          </p>
        </section>

        {(exercises ?? []).length === 0 && (
          <p className={styles.empty}>
            Inga övningar hittades. Har databasschemat och seed-datan körts i
            Supabase (se <code>supabase/migrations/</code>)?
          </p>
        )}

        {[...groups.entries()].map(([bodyPart, items]) => (
          <section key={bodyPart} className={styles.group}>
            <h2 className={styles.groupTitle}>{bodyPart}</h2>
            <div className={styles.grid}>
              {items.map((exercise) => (
                <div key={exercise.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <h3>{exercise.title}</h3>
                    <div className={styles.tags}>
                      {exercise.equipment && (
                        <span className="tag">{exercise.equipment}</span>
                      )}
                      {exercise.sets_reps && (
                        <span className="tag">
                          {exercise.sets_reps.split(" · ")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <FavoriteButton
                    exerciseId={exercise.id}
                    initialFavorited={favoriteIds.has(exercise.id)}
                    loggedIn={!!user}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        <Footer />
      </div>
    </>
  );
}
