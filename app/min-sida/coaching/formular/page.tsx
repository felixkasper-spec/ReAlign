import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "../../Sidebar";
import MobileTabs from "../../MobileTabs";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { isClinicStaffEmail } from "@/lib/coach";
import shellStyles from "../../page.module.css";
import IntakeForm from "./IntakeForm";

export default async function CoachingIntakePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, subscription, { data: intake }] = await Promise.all(
    [
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single(),
      getSubscription(),
      supabase
        .from("coaching_intake")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ],
  );

  const hasCoaching =
    subscription.active && subscription.plan === "premium_coaching";
  if (!hasCoaching) {
    redirect("/min-sida");
  }

  const isCoach = !!user.email && user.email === process.env.COACH_EMAIL;
  const isClinicStaff = isClinicStaffEmail(user.email);
  const firstName = profile?.display_name?.trim();

  return (
    <>
      <Header />
      <div className={shellStyles.shell}>
        <Sidebar
          firstName={firstName}
          userEmail={user.email}
          hasCoaching={hasCoaching}
          linkPrefix="/min-sida"
          activeFormular
          isCoach={isCoach}
          isClinicStaff={isClinicStaff}
          canBuildProgram={subscription.active}
        />

        <main className={shellStyles.main}>
          <MobileTabs
            hasCoaching={hasCoaching}
            linkPrefix="/min-sida"
            activeFormular
            isCoach={isCoach}
            isClinicStaff={isClinicStaff}
            canBuildProgram={subscription.active}
          />
          <div className={shellStyles.topbar}>
            <div>
              <span className="eyebrow">Min sida</span>
              <h1>Kom igång-formulär</h1>
              <p>
                Fyll i det här så att Felix har allt som behövs för att sätta
                ihop en skräddarsydd plan för dig. Tar cirka 5–10 minuter.
              </p>
            </div>
          </div>

          <IntakeForm intake={intake ?? null} />
        </main>
      </div>
    </>
  );
}
