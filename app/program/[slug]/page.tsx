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
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { programMeta } from "@/lib/program-meta";
import { pageMetadata } from "@/lib/page-metadata";
import VariantPicker, { type VariantExercise } from "./VariantPicker";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: program } = await supabase
    .from("programs")
    .select("title, description, category")
    .eq("slug", slug)
    .maybeSingle();

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

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!program) {
    notFound();
  }

  const { data: rows } = await supabase
    .from("program_exercises")
    .select("variant, is_warmup, order_index, exercises ( slug, title, body_part )")
    .eq("program_id", program.id)
    .order("order_index");

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

  const [subscription, userResult] = await Promise.all([
    getSubscription(),
    supabase.auth.getUser(),
  ]);
  const locked = program.tier === "premium" && !subscription.active;
  const user = userResult.data.user;

  let completions = 0;
  if (user && subscription.active) {
    const { count } = await supabase
      .from("logged_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("program_id", program.id)
      .not("completed_at", "is", null);
    completions = count ?? 0;
  }

  const meta = programMeta[program.slug];
  const exerciseCount = (variants.full ?? []).length;
  const defaultVariant = langd ?? "full";

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.breadcrumb}>
          <Link href="/program">Program</Link>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>{program.title}</span>
        </div>

        <div className={styles.progHead}>
          <span className="eyebrow">{meta?.purpose ?? program.category}</span>
          <h1>{program.title}</h1>
          <div className={styles.progTags}>
            {meta?.level && <span className={`tag ${styles.tagLevel}`}>{meta.level}</span>}
            <span className="tag">{meta?.purpose ?? program.category}</span>
            <span className="tag">
              {program.tier === "premium" ? "Premium" : "Gratis"}
            </span>
          </div>
        </div>

        {program.hero_image && (
          <div className={styles.heroImage}>
            <Image src={program.hero_image} alt={program.title} fill sizes="900px" />
          </div>
        )}

        {program.description && <p className={styles.progIntro}>{program.description}</p>}

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <b>{exerciseCount || warmup.length}</b>Övningar
          </div>
          {meta?.level && (
            <div className={styles.metaItem}>
              <b>{meta.level}</b>Nivå
            </div>
          )}
          <div className={styles.metaItem}>
            <b>{meta?.purpose ?? program.category}</b>Fokus
          </div>
          {completions > 0 && (
            <div className={styles.metaItem}>
              <b>{completions}</b>
              {completions === 1 ? "Gång klarad" : "Gånger klarat"}
            </div>
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
              Lås upp {program.title} och resten av programbiblioteket för
              149 kr/mån.
            </p>
            <Link className="btn btn-primary" href="/min-sida">
              Bli Premium →
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
                    href={`/ovningsbank/${ex.slug}?program=${program.slug}&variant=${defaultVariant}`}
                    className={styles.exRow}
                  >
                    <span className={styles.exNum}>{i + 1}</span>
                    <span className={styles.exInfo}>
                      <h3>{ex.title}</h3>
                      <span className="tag">{ex.body_part}</span>
                      <span className={`tag ${styles.tagWarmup}`}>
                        1 set – uppvärmning
                      </span>
                    </span>
                    <span className={styles.exArrow}>→</span>
                  </Link>
                ))}
              </div>
            )}

            <VariantPicker
              variants={variants}
              defaultVariant={defaultVariant}
              programSlug={program.slug}
            />
          </>
        )}

        {!locked && !user && (
          <GuestAccountPrompt text="Spara det här programmet, schemalägg pass och håll koll på din progression." />
        )}

        <div className={styles.ctaRow}>
          {!locked && user && (
            <form action={logProgramCompletion.bind(null, program.id, program.title)}>
              <SubmitButton className="btn btn-primary" pendingText="Loggar...">
                ✓ Markera som klar
              </SubmitButton>
            </form>
          )}
          {!locked && !user && (
            <Link className="btn btn-primary" href="/min-sida">
              Starta programmet
            </Link>
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
            Tillbaka till Program
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <ShareButton title={program.title} />
        </div>

        <Footer />
      </div>
    </>
  );
}
