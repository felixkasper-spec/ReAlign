import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

function renderInstructions(text: string) {
  const blocks = text.split("\n\n");
  return blocks.map((block, i) => {
    const lines = block.split("\n").filter(Boolean);
    const isBulletList = lines.every((l) => l.startsWith("- "));
    if (isBulletList) {
      return (
        <ul className={styles.bulletList} key={i}>
          {lines.map((line, j) => (
            <li className={styles.bulletItem} key={j}>
              <span className={styles.dot2} />
              {line.replace(/^- /, "")}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{block}</p>;
  });
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: exercise }, userResult] = await Promise.all([
    supabase.from("exercises").select("*").eq("slug", slug).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!exercise) {
    notFound();
  }

  const user = userResult.data.user;

  let isFavorited = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("exercise_id", exercise.id)
      .maybeSingle();
    isFavorited = !!fav;
  }

  const { data: related } = await supabase
    .from("exercises")
    .select("id, slug, title, body_part")
    .eq("body_part", exercise.body_part)
    .neq("id", exercise.id)
    .limit(4);

  const metaItems = (exercise.sets_reps ?? "")
    .split(" · ")
    .filter(Boolean);

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.breadcrumb}>
          <Link href="/ovningsbank">Övningsbank</Link>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>{exercise.title}</span>
        </div>

        <div className={styles.layout}>
          <div className={styles.videoWrap}>
            {exercise.video_url && (
              <div className={styles.videoFrame}>
                <iframe
                  src={exercise.video_url}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div className={styles.videoCaption}>
              <span>Video</span>
              <div style={{ display: "flex", gap: 8 }}>
                <FavoriteButton
                  exerciseId={exercise.id}
                  initialFavorited={isFavorited}
                  loggedIn={!!user}
                />
                <ShareButton title={exercise.title} />
              </div>
            </div>
          </div>

          <div>
            <div className={styles.exHead}>
              <span className="eyebrow">{exercise.body_part}</span>
              <h1>{exercise.title}</h1>
              <div className={styles.exTags}>
                <span className={`tag ${styles.tagBody}`}>{exercise.body_part}</span>
                {exercise.equipment && (
                  <span className="tag">{exercise.equipment}</span>
                )}
              </div>
            </div>

            {metaItems.length > 0 && (
              <div className={styles.metaRow}>
                {metaItems.map((item: string, i: number) => (
                  <div className={styles.metaItem} key={i}>
                    {item}
                  </div>
                ))}
              </div>
            )}

            {exercise.instructions && (
              <div className={styles.exSection}>
                <h2>Utförande</h2>
                {renderInstructions(exercise.instructions)}
              </div>
            )}

            {exercise.tips && (
              <div className={styles.exSection}>
                <div className={styles.tipsBox}>
                  <span className="eyebrow" style={{ marginBottom: 10, display: "block" }}>
                    Tips
                  </span>
                  <div className={styles.tipLine}>
                    <span className={styles.dot2} />
                    {exercise.tips}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.ctaRow}>
              <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href="/ovningsbank">
                ← Tillbaka till Övningsbank
              </Link>
            </div>
          </div>
        </div>

        {related && related.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedHead}>
              <h2>Fler övningar för {exercise.body_part}</h2>
              <Link href="/ovningsbank" className={styles.allLink}>
                Se alla →
              </Link>
            </div>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <Link key={r.id} href={`/ovningsbank/${r.slug}`} className={styles.relCard}>
                  <div className={styles.relThumb}>▶</div>
                  <div className={styles.relBody}>
                    <h3>{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
}
