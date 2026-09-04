import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";
import TrainingTips from "@/components/TrainingTips";
import GuestAccountPrompt from "@/components/GuestAccountPrompt";
import SubmitButton from "@/components/SubmitButton";
import { logProgramCompletion } from "@/app/min-sida/schedule-actions";
import { createClient } from "@/lib/supabase/server";
import { programMeta } from "@/lib/program-meta";
import { pageMetadata } from "@/lib/page-metadata";
import VariantPicker, { type VariantExercise } from "../program/[slug]/VariantPicker";
import styles from "../program/[slug]/page.module.css";

const PROGRAM_SLUG = "helkropp-niva-2";

export const metadata = pageMetadata({
  title: "Testa ett 5-minuters program — ReAlign Metoden",
  description:
    "Tre korta övningar, klart på fem minuter. Det snabbaste sättet att känna vad postural träning gör för kroppen — helt gratis, inget konto krävs.",
  image: "/og/default.png",
  path: "/5-minuter",
});

export default async function FiveMinutesPage() {
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", PROGRAM_SLUG)
    .maybeSingle();

  if (!program) {
    return null;
  }

  const { data: rows } = await supabase
    .from("program_exercises")
    .select("variant, order_index, exercises ( slug, title, body_part )")
    .eq("program_id", program.id)
    .eq("variant", "kort")
    .order("order_index");

  const exercises: VariantExercise[] = (rows ?? [])
    .map((row) => row.exercises as unknown as VariantExercise | null)
    .filter((ex): ex is VariantExercise => ex != null);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const meta = programMeta[PROGRAM_SLUG];

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.breadcrumb}>
          <Link href="/">Hem</Link>
          <span className={styles.sep}>/</span>
          <span className={styles.current}>5-minuters program</span>
        </div>

        <div className={styles.heroSplit}>
          <div className={styles.progHead}>
            <div className={styles.progTags}>
              <span className={`tag ${styles.tagBeginner}`}>Nybörjare</span>
              <span className="tag">{meta?.purpose ?? program.category}</span>
              <span className={`tag ${styles.tagFree}`}>Gratis</span>
            </div>
            <h1 style={{ marginTop: 12 }}>Testa ett 5-minuters program</h1>
          </div>

          {program.hero_image && (
            <div className={styles.heroImage}>
              <Image
                src={program.hero_image}
                alt={program.title}
                fill
                sizes="(max-width: 880px) 700px, 400px"
              />
            </div>
          )}

          <div className={styles.progIntro}>
            <p>
              Ett enkelt sätt att komma igång. Gör programmet varje dag i
              minst en vecka — ett bra sätt att känna hur det kan kännas när
              hållningsmusklerna blir mer aktiva.
            </p>
            <p>
              För ökad tydlighet: ställ dig upp och känn efter hur det känns
              att bara stå. Gör sedan programmet och följ instruktionerna
              noggrant. Ställ dig upp igen och se om du upplever någon
              skillnad.
            </p>
            <p>Det kan ta några dagar innan effekten känns av. Lycka till!</p>
          </div>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <b>{exercises.length}</b>Övningar
          </div>
          <div className={styles.metaItem}>
            <b>Nybörjare</b>Nivå
          </div>
          <div className={styles.metaItem}>
            <b>{meta?.purpose ?? program.category}</b>Fokus
          </div>
        </div>

        <TrainingTips />

        <VariantPicker
          variants={{ kort: exercises }}
          defaultVariant="kort"
          programSlug={program.slug}
        />

        <div className={styles.progressionBox}>
          Gillade du känslan? {" "}
          <Link
            href={`/program/${PROGRAM_SLUG}`}
            style={{ color: "var(--sage)", textDecoration: "underline" }}
          >
            Se hela {program.title}
          </Link>{" "}
          eller{" "}
          <Link
            href="/program"
            style={{ color: "var(--sage)", textDecoration: "underline" }}
          >
            bläddra bland alla program
          </Link>
          .
        </div>

        {!user && (
          <GuestAccountPrompt text="Spara dina program, schemalägg pass och håll koll på din progression." />
        )}

        <div className={styles.ctaRow}>
          {user ? (
            <form action={logProgramCompletion.bind(null, program.id, program.title)}>
              <SubmitButton className="btn btn-primary" pendingText="Loggar...">
                ✓ Markera som klar
              </SubmitButton>
            </form>
          ) : (
            <Link className="btn btn-primary" href="/min-sida">
              Starta programmet
            </Link>
          )}
          <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href="/">
            Tillbaka till startsidan
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <ShareButton title="Testa ett 5-minuters program — ReAlign Metoden" />
        </div>

        <Footer />
      </div>
    </>
  );
}
