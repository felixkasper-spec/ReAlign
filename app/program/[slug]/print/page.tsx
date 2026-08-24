import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import PrintTrigger from "./PrintTrigger";
import styles from "./page.module.css";

type PrintExercise = {
  slug: string;
  title: string;
  body_part: string;
  equipment: string | null;
  sets_reps: string | null;
};

export default async function ProgramPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { slug } = await params;
  const { variant } = await searchParams;
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, slug, title, tier")
    .eq("slug", slug)
    .maybeSingle();

  if (!program) {
    notFound();
  }

  const subscription = await getSubscription();
  if (!subscription.active) {
    redirect(`/program/${program.slug}`);
  }

  const { data: rows } = await supabase
    .from("program_exercises")
    .select(
      "variant, is_warmup, order_index, exercises ( slug, title, body_part, equipment, sets_reps )",
    )
    .eq("program_id", program.id)
    .order("order_index");

  const activeVariant = variant ?? "full";
  const warmup: PrintExercise[] = [];
  const main: PrintExercise[] = [];

  for (const row of rows ?? []) {
    const ex = row.exercises as unknown as PrintExercise | null;
    if (!ex) continue;
    if (row.is_warmup) {
      warmup.push(ex);
    } else if (row.variant === activeVariant) {
      main.push(ex);
    }
  }

  const today = new Date().toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.wrap}>
      <PrintTrigger />
      <span className={styles.eyebrow}>ReAlign Metoden</span>
      <h1 className={styles.title}>{program.title}</h1>
      <p className={styles.meta}>Utskrivet {today}</p>

      {warmup.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Uppvärmning</h2>
          {warmup.map((ex, i) => (
            <div className={styles.row} key={ex.slug}>
              <span className={styles.num}>{i + 1}</span>
              <div className={styles.rowBody}>
                <div className={styles.rowTitle}>{ex.title}</div>
                <div className={styles.rowMeta}>
                  {[ex.equipment, ex.sets_reps].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Övningar</h2>
        {main.map((ex, i) => (
          <div className={styles.row} key={ex.slug}>
            <span className={styles.num}>{i + 1}</span>
            <div className={styles.rowBody}>
              <div className={styles.rowTitle}>{ex.title}</div>
              <div className={styles.rowMeta}>
                {[ex.equipment, ex.sets_reps].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className={styles.footer}>
        Fler detaljer, videor och instruktioner för varje övning hittar du på
        realignmetod.vercel.app
      </p>
    </div>
  );
}
