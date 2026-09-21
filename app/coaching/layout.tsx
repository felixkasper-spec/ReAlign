import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "./kalender/AdminSidebar";
import shellStyles from "./kalender/admin-shell.module.css";

// Tjänstelistan (för Tjänster-popupen) hämtas live på varje request — får
// aldrig bakas in vid build-time, annars visas en inaktuell lista tills
// nästa driftsättning.
export const dynamic = "force-dynamic";

// Gemensam ram för hela /coaching-avdelningen (Admin-inkorg, kalender,
// kunder, leads, upplägg, kundprogram m.fl.) — sidomenyn ska alltid synas
// oavsett vilken av de sidorna man är på. Ersätter den tidigare mönstret
// där varje sida renderade sin egen publika <Header/>/<Footer/> — det här
// är ett internt admin-verktyg, inte en publik sida. Varje sida behåller
// själv sin egen inloggningskontroll (requireCoach/requireClinicStaff) —
// layouten gör bara det visuella skalet, inte behörighetskontrollen.
export default async function CoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = createAdminClient();
  const { data: services } = await admin
    .from("booking_services")
    .select("id, name, duration_minutes, price_sek, active")
    .order("sort_order");

  return (
    <div className={shellStyles.pageWrap}>
      <div className={shellStyles.pageLayout}>
        <AdminSidebar services={services ?? []} />
        <div className={shellStyles.mainContent}>{children}</div>
      </div>
    </div>
  );
}
