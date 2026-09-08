import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import TrainingTips from "@/components/TrainingTips";
import GuestAccountPrompt from "@/components/GuestAccountPrompt";
import LockedContentNudge from "@/components/LockedContentNudge";
import SubmitButton from "@/components/SubmitButton";
import { logProgramCompletion } from "@/app/min-sida/schedule-actions";
import { hasThumbnail } from "@/app/ovningsbank/thumbnails";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { programMeta } from "@/lib/program-meta";
import { pageMetadata } from "@/lib/page-metadata";
import { levelTagKey } from "@/lib/level-tag";
import {
  getCachedProgram,
  getCachedProgramExercises,
  getCachedNextLevelProgram,
} from "@/lib/program-content-cache";
import VariantPicker, { type VariantExercise } from "./VariantPicker";
import IntroExpand from "./IntroExpand";
import SaveForLaterForm from "./SaveForLaterForm";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getCachedProgram(slug);

  if (!program) {
    return pageMetadata({
      title: "Program — ReAlign Metoden",
      description: "Träningsprogram byggt för postural träning.",
      path: `/program/${slug}`,
    });
  }

  const meta = programMeta[slug];
  return pageMetadata({
    title: `${program.title} — ReAlign Metoden`,
    description:
      program.description ??
      `${meta?.purpose ?? program.category}-program${meta?.level ? ` · ${meta.level}` : ""} från ReAlign Metoden.`,
    path: `/program/${slug}`,
  });
}

export default async function ProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ langd?: string }>;
}) {
  const { slug } = await params;
  const { langd } = await searchParams;
  const supabase = await createClient();

  const [program, subscription, userResult] = await Promise.all([
    getCachedProgram(slug),
    getSubscription(),
    supabase.auth.getUser(),
  ]);

  if (!program) {
    notFound();
  }

  const user = userResult.data.user;
  const locked = program.tier === "premium" && !subscription.active;

  const [rows, nextLevelProgram] = await Promise.all([
    getCachedProgramExercises(program.id),
    program.level != null
      ? getCachedNextLevelProgram(program.category, program.level + 1)
      : Promise.resolve(null),
  ]);

  const variants: Record<string, VariantExercise[]> = {};
  const warmup: VariantExercise[] = [];

  for (const row of rows ?? []) {
    const ex = row.exercises as unknown as VariantExercise | null;
    if (!ex) continue;
    if (row.is_warmup) {
      warmup.push(ex);
      continue;
    }
    const key = row.variant as string;
    variants[key] = variants[key] ?? [];
    variants[key].push(ex);
  }
  const progressionPrefix =
    "Efter minst 10 pass, och när du känner att du har bra koll på tekniken, du får kontakt där övningen ska kännas, och att det börjar bli lätt att göra angivet antal repetitioner, testa att gå vidare till ";

  const meta = programMeta[program.slug];
  const defaultVariant = langd ?? "full";
  const firstExerciseSlug =
    warmup[0]?.slug ?? variants[defaultVariant]?.[0]?.slug ?? variants.full?.[0]?.slug;
  const hasMultipleVariants =
    ["full", "mellan", "kort"].filter((k) => variants[k]?.length).length > 1;
  const startHref = locked
    ? undefined
    : hasMultipleVariants
      ? "#ovningar"
      : firstExerciseSlug
        ? `/program/${program.slug}/spela?variant=${defaultVariant}`
        : undefined;
  const levelTagClass = {
    beginner: styles.tagBeginner,
    intermediate: styles.tagIntermediate,
    advanced: styles.tagAdvanced,
    allLevels: styles.tagAllLevels,
  }[levelTagKey(meta?.level)];

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.breadcrumb}>
          <Link href="/program">Program</Link>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>{program.title}</span>
        </div>

        <div className={styles.heroSplit}>
          <div className={styles.progHead}>
            <h1>{program.title}</h1>
            <div className={styles.progTags}>
              {meta?.level && <span className={`tag ${levelTagClass}`}>{meta.level}</span>}
              <span
                className={`tag ${program.tier === "premium" ? styles.tagPremium : styles.tagFree}`}
              >
                {program.tier === "premium" ? "Premium" : "Gratis"}
              </span>
            </div>
            {startHref && (
              <div className={styles.desktopStartRow}>
                {startHref.startsWith("#") ? (
                  <a href={startHref} className={styles.startProgramBtn}>
                    Starta program →
                  </a>
                ) : (
                  <Link href={startHref} className={styles.startProgramBtn}>
                    Starta program →
                  </Link>
                )}
              </div>
            )}
          </div>

          {program.hero_image && (
            <div className={styles.heroImage}>
              <Image
                src={program.hero_image}
                alt={program.title}
                fill
                sizes="(max-width: 880px) 700px, 400px"
              />
              {startHref && (
                <>
                  <div className={styles.heroScrim} />
                  {startHref.startsWith("#") ? (
                    <a href={startHref} className={styles.heroStartBtn}>
                      Starta program →
                    </a>
                  ) : (
                    <Link href={startHref} className={styles.heroStartBtn}>
                      Starta program →
                    </Link>
                  )}
                </>
              )}
            </div>
          )}

          {program.description && (
            <IntroExpand
              paragraphs={program.description.split("\n\n")}
              hideJumpRow={!!startHref}
            />
          )}
        </div>

        <TrainingTips />

        {locked ? (
          <>
            <LockedContentNudge />
            <div className={styles.lockedBox}>
            <span className="eyebrow" style={{ color: "var(--warm)" }}>
              Premium
            </span>
            <h3 style={{ fontSize: "1.2rem", margin: "10px 0 8px", fontWeight: 500 }}>
              Det här programmet ingår i Premium
            </h3>
            <p style={{ color: "var(--text)", fontSize: "0.92rem", marginBottom: 18 }}>
              Lås upp {program.title} och resten av programbiblioteket —
              första månaden till halva priset, 74,50 kr, sen 149 kr/mån.
            </p>
            <Link className="btn btn-primary" href="/premium">
              Läs mer om Premium →
            </Link>
            <p style={{ color: "var(--sage)", fontSize: "0.78rem", marginTop: 10 }}>
              ✓ Går att betala med friskvårdsbidrag
            </p>
            </div>
          </>
        ) : (
          <>
            {warmup.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <div className={styles.exListHead}>
                  <h2>Uppvärmning</h2>
                  <span>{warmup.length} st</span>
                </div>
                {warmup.map((ex, i) => (
                  <Link
                    key={ex.slug}
                    href={`/program/${program.slug}/spela?variant=${defaultVariant}&start=${ex.slug}`}
                    className={styles.exRow}
                  >
                    <span className={styles.exNum}>{i + 1}</span>
                    {hasThumbnail(ex.slug) && (
                      <span className={styles.exThumb}>
                        <Image src={`/exercises/${ex.slug}.jpg`} alt="" fill sizes="52px" />
                        <span className={styles.playIcon} aria-hidden="true">
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="white">
                            <path d="M3 1.5v11l9-5.5-9-5.5z" />
                          </svg>
                        </span>
                      </span>
                    )}
                    <span className={styles.exInfo}>
                      <h3>{ex.title}</h3>
                      <span className={`tag ${styles.tagWarmup}`}>
                        1 set – uppvärmning
                      </span>
                    </span>
                    <span className={styles.exArrow}>→</span>
                  </Link>
                ))}
              </div>
            )}

            <div id="ovningar">
              <VariantPicker
                variants={variants}
                defaultVariant={defaultVariant}
                playerBasePath={`/program/${program.slug}/spela`}
              />
            </div>

            {!user && (
              <SaveForLaterForm programSlug={program.slug} programTitle={program.title} />
            )}
          </>
        )}

        {!locked && nextLevelProgram && (
          <div className={styles.progressionBox}>
            {progressionPrefix}
            <Link
              href={`/program/${nextLevelProgram.slug}`}
              style={{ color: "var(--sage)", textDecoration: "underline" }}
            >
              {nextLevelProgram.title}
            </Link>
            .
          </div>
        )}

        {!locked && !user && (
          <GuestAccountPrompt />
        )}

        <div className={styles.ctaRow}>
          {!locked && user && (
            <form action={logProgramCompletion.bind(null, program.id, program.title)}>
              <SubmitButton className="btn btn-primary" pendingText="Loggar...">
                ✓ Markera som klar
              </SubmitButton>
            </form>
          )}
          {!locked && subscription.active && (
            <Link
              className="btn btn-ghost"
              style={{ border: "1px solid var(--line)" }}
              href={`/program/${program.slug}/print?variant=${defaultVariant}`}
              target="_blank"
            >
              Ladda ner PDF →
            </Link>
          )}
          <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href="/program">
            {program.slug === "kontorsvardag" ? "Se fler program →" : "Tillbaka till Program"}
          </Link>
          <ShareButton title={program.title} />
        </div>

        <Footer />
      </div>
    </>
  );
}
