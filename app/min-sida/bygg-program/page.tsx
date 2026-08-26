import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "../Sidebar";
import MobileTabs from "../MobileTabs";
import BuilderClient from "./BuilderClient";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import shellStyles from "../page.module.css";

export default async function BuildProgramPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, subscription, { data: exercises }, { data: favorites }] =
    await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user.id).single(),
      getSubscription(),
      supabase
        .from("exercises")
        .select("id, slug, title, body_part")
        .order("body_part")
        .order("title"),
      supabase.from("favorites").select("exercise_id").eq("user_id", user.id),
    ]);

  if (!subscription.active) {
    redirect("/premium");
  }

  const favoriteIds = (favorites ?? []).map((f) => f.exercise_id);

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
          canBuildProgram={subscription.active}
        />

        <main className={shellStyles.main}>
          <MobileTabs
            hasCoaching={subscription.plan === "premium_coaching" && subscription.active}
            linkPrefix="/min-sida"
            canBuildProgram={subscription.active}
          />
          <div className={shellStyles.topbar}>
            <div>
              <span className="eyebrow">Min sida</span>
              <h1>Bygg ditt eget program</h1>
              <p>Sök bland alla övningar och kombinera dem till ett eget, ordnat program.</p>
            </div>
          </div>

          <BuilderClient exercises={exercises ?? []} favoriteIds={favoriteIds} />
        </main>
      </div>
    </>
  );
}
