import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "../Sidebar";
import MobileTabs from "../MobileTabs";
import BuilderClient from "./BuilderClient";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import shellStyles from "../page.module.css";
import styles from "./page.module.css";

export default async function BuildProgramPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, subscription, { data: favorites }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    getSubscription(),
    supabase
      .from("favorites")
      .select("exercise_id, exercises ( id, slug, title, body_part )")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!subscription.active) {
    redirect("/premium");
  }

  const favExercises = (favorites ?? [])
    .map((f) => f.exercises as unknown as { id: string; slug: string; title: string; body_part: string } | null)
    .filter((e): e is { id: string; slug: string; title: string; body_part: string } => !!e);

  const firstName = profile?.display_name?.trim();

  return (
    <>
      <Header />
      <div className={shellStyles.shell}>
        <Sidebar
          firstName={firstName}
          userEmail={user.email}
          hasCoaching={subscription.plan === "premium_coaching" && subscription.active}
          linkPrefix="/min-sida"
        />

        <main className={shellStyles.main}>
          <MobileTabs
            hasCoaching={subscription.plan === "premium_coaching" && subscription.active}
            linkPrefix="/min-sida"
          />
          <div className={shellStyles.topbar}>
            <div>
              <span className="eyebrow">Min sida</span>
              <h1>Bygg ditt eget program</h1>
              <p>Kombinera dina favoritövningar till ett eget, ordnat program.</p>
            </div>
          </div>

          {favExercises.length === 0 ? (
            <div className={styles.empty}>
              <p>
                Du har inga sparade favoritövningar än. Bläddra i övningsbanken
                och spara några för att kunna bygga ett eget program av dem.
              </p>
              <Link className="btn btn-primary" href="/ovningsbank">
                Till övningsbanken →
              </Link>
            </div>
          ) : (
            <BuilderClient favorites={favExercises} />
          )}
        </main>
      </div>
    </>
  );
}
