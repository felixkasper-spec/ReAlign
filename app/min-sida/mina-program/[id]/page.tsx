import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "../../Sidebar";
import MobileTabs from "../../MobileTabs";
import SubmitButton from "@/components/SubmitButton";
import {
  logCustomProgramCompletion,
  deleteCustomProgram,
} from "../../custom-program-actions";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import shellStyles from "../../page.module.css";
import styles from "./page.module.css";

export default async function CustomProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, subscription, { data: program }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    getSubscription(),
    supabase
      .from("custom_programs")
      .select("id, title, user_id")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!program || program.user_id !== user.id) {
    notFound();
  }

  const [{ data: rows }, { count: completions }] = await Promise.all([
    supabase
      .from("custom_program_exercises")
      .select("order_index, exercises ( slug, title, body_part, equipment )")
      .eq("custom_program_id", id)
      .order("order_index"),
    supabase
      .from("logged_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("custom_program_id", id)
      .not("completed_at", "is", null),
  ]);

  const exercises = (rows ?? [])
    .map(
      (r) =>
        r.exercises as unknown as {
          slug: string;
          title: string;
          body_part: string;
          equipment: string | null;
        } | null,
    )
    .filter((e): e is NonNullable<typeof e> => !!e);

  const firstName = profile?.display_name?.trim();
  const hasCoaching = subscription.plan === "premium_coaching" && subscription.active;

  return (
    <>
      <Header />
      <div className={shellStyles.shell}>
        <Sidebar
          firstName={firstName}
          userEmail={user.email}
          hasCoaching={hasCoaching}
          linkPrefix="/min-sida"
          canBuildProgram={subscription.active}
        />

        <main className={shellStyles.main}>
          <MobileTabs
            hasCoaching={hasCoaching}
            linkPrefix="/min-sida"
            canBuildProgram={subscription.active}
          />
          <div className={shellStyles.topbar}>
            <div>
              <span className="eyebrow">Eget program</span>
              <h1>{program.title}</h1>
              <p>
                {exercises.length} {exercises.length === 1 ? "övning" : "övningar"}
                {completions ? ` · Klarat ${completions} ${completions === 1 ? "gång" : "gånger"}` : ""}
              </p>
            </div>
          </div>

          <div className={styles.list}>
            {exercises.map((ex, i) => (
              <Link key={ex.slug} href={`/ovningsbank/${ex.slug}`} className={styles.row}>
                <span className={styles.num}>{i + 1}</span>
                <span className={styles.rowBody}>
                  <span className={styles.rowTitle}>{ex.title}</span>
                  <span className={styles.rowMeta}>
                    {[ex.body_part, ex.equipment].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className={styles.arrow}>→</span>
              </Link>
            ))}
          </div>

          <div className={styles.ctaRow}>
            <form action={logCustomProgramCompletion.bind(null, program.id, program.title)}>
              <SubmitButton className="btn btn-primary" pendingText="Loggar...">
                ✓ Markera som klar
              </SubmitButton>
            </form>
            <form action={deleteCustomProgram.bind(null, program.id)}>
              <button type="submit" className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>
                Ta bort program
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
