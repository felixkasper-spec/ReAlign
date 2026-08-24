import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import VimeoEmbed from "@/components/VimeoEmbed";
import { createClient } from "@/lib/supabase/server";
import { getProgramExerciseSequence } from "@/lib/program-exercise-sequence";
import { getPremiumExerciseSlugs } from "@/lib/exercise-tier";
import { getSubscription } from "@/lib/subscription";
import { hasThumbnail } from "../thumbnails";
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ program?: string; variant?: string }>;
}) {
  const { slug } = await params;
  const { program: programSlug, variant } = await searchParams;
  const supabase = await createClient();

  const [{ data: exercise }, userResult] = await Promise.all([
    supabase.from("exercises").select("*").eq("slug", slug).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!exercise) {
    notFound();
  }

  const user = userResult.data.user;

  const premiumSlugs = await getPremiumExerciseSlugs();
  const isPremiumExercise = premiumSlugs.has(slug);
  const subscription = isPremiumExercise ? await getSubscription() : null;
  const locked = isPremiumExercise && !subscription?.active;

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

  let programNav: {
    programTitle: string;
    prev: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
  } | null = null;

  if (programSlug && variant) {
    const result = await getProgramExerciseSequence(programSlug, variant);
    if (result) {
      const i = result.sequence.findIndex((e) => e.slug === slug);
      if (i !== -1) {
        programNav = {
          programTitle: result.programTitle,
          prev: i > 0 ? result.sequence[i - 1] : null,
          next: i < result.sequence.length - 1 ? result.sequence[i + 1] : null,
        };
      }
    }
  }

  const metaItems = (exercise.sets_reps ?? "")
    .split(" · ")
    .filter(Boolean);

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.breadcrumb}>
          {programNav ? (
            <>
              <Link href={`/program/${programSlug}`}>{programNav.programTitle}</Link>
              <span className={styles.sep}>/</span>
            </>
          ) : (
            <>
              <Link href="/ovningsbank">Övningsbank</Link>
              <span className={styles.sep}>/</span>
            </>
          )}
          <span className={styles.current}>{exercise.title}</span>
        </div>

        {programNav && (programNav.prev || programNav.next) && (
          <div className={styles.programNav}>
            {programNav.prev && (
              <Link
                href={`/ovningsbank/${programNav.prev.slug}?program=${programSlug}&variant=${variant}`}
                className={styles.programNavLink}
              >
                <span className={styles.programNavDir}>← Föregående</span>
                <span className={styles.programNavTitle}>{programNav.prev.title}</span>
              </Link>
            )}
            {programNav.next && (
              <Link
                href={`/ovningsbank/${programNav.next.slug}?program=${programSlug}&variant=${variant}`}
                className={`${styles.programNavLink} ${styles.programNavRight}`}
              >
                <span className={styles.programNavDir}>Nästa →</span>
                <span className={styles.programNavTitle}>{programNav.next.title}</span>
              </Link>
            )}
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.videoWrap}>
            {locked ? (
              <div className={styles.lockedBox}>
                <span className="eyebrow" style={{ color: "var(--warm)" }}>
                  Premium
                </span>
                <h3 style={{ fontSize: "1.1rem", margin: "10px 0 8px", fontWeight: 500 }}>
                  Den här övningen ingår i Premium
                </h3>
                <p style={{ color: "var(--text)", fontSize: "0.9rem", marginBottom: 18 }}>
                  Lås upp video, instruktioner och resten av övningsbanken för
                  149 kr/mån.
                </p>
                <Link className="btn btn-primary" href="/min-sida">
                  Bli Premium →
                </Link>
              </div>
            ) : (
              exercise.video_url && (
                <VimeoEmbed src={exercise.video_url} className={styles.videoFrame} />
              )
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

            {!locked && exercise.instructions && (
              <div className={styles.exSection}>
                <h2>Utförande</h2>
                {renderInstructions(exercise.instructions)}
              </div>
            )}

            {!locked && exercise.tips && (
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
                  {hasThumbnail(r.slug) ? (
                    <div className={`img-duo ${styles.relThumb}`}>
                      <Image
                        src={`/exercises/${r.slug}.jpg`}
                        alt={r.title}
                        fill
                        sizes="(max-width: 880px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className={styles.relThumb}>▶</div>
                  )}
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
