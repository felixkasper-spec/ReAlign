import Image from "next/image";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "../Sidebar";
import MobileTabs from "../MobileTabs";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { isClinicStaffEmail } from "@/lib/coach";
import { COACHING_ATTACHMENT_BUCKET } from "@/lib/coaching-attachments";
import ChatThread from "./ChatThread";
import Composer from "./Composer";
import shellStyles from "../page.module.css";
import styles from "./page.module.css";

export default async function CoachingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Samma fallback-mönster som coach-sidan (/coaching/[userId]) — ett fel på
  // en enda extra kolumn (t.ex. en migration som inte hunnit köras) ska
  // aldrig kunna slå ut resten av sidans data, bara dölja Drive-bannern.
  const [profileResult, subscription] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, drive_folder_url")
      .eq("id", user.id)
      .single(),
    getSubscription(),
  ]);
  let profile: { display_name: string | null; drive_folder_url: string | null } | null =
    profileResult.data;
  if (profileResult.error) {
    console.error("CoachingPage — kunde inte hämta profil (med drive_folder_url):", profileResult.error);
    const fallback = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();
    profile = fallback.data ? { ...fallback.data, drive_folder_url: null } : null;
  }

  // Chatten är öppen för alla inloggade användare, inte bara Premium
  // Coaching-prenumeranter — behövs för att kunna svara fysiska
  // klinikkunder (kopplade via customers-tabellen, se kundens sida i
  // adminverktyget) som inte nödvändigtvis har en aktiv prenumeration.
  // hasCoaching styr fortfarande "Kom igång-formulär"-länken, som är en
  // Premium Coaching-specifik onboarding-flow.
  const hasCoaching = subscription.active && subscription.plan === "premium_coaching";

  const isCoach = !!user.email && user.email === process.env.COACH_EMAIL;
  const isClinicStaff = isClinicStaffEmail(user.email);

  const { data: coachingMessages } = await supabase
    .from("coaching_messages")
    .select("id, sender, body, created_at, attachment_path, attachment_type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const messagesWithUrls = await Promise.all(
    (coachingMessages ?? []).map(async (m) => {
      if (!m.attachment_path) {
        return { ...m, attachment_url: null };
      }
      const { data } = await supabase.storage
        .from(COACHING_ATTACHMENT_BUCKET)
        .createSignedUrl(m.attachment_path, 3600);
      return { ...m, attachment_url: data?.signedUrl ?? null };
    }),
  );

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
          activeCoaching
          isCoach={isCoach}
          isClinicStaff={isClinicStaff}
          canBuildProgram={subscription.active}
        />

        <main className={shellStyles.main}>
          <MobileTabs
            hasCoaching={hasCoaching}
            linkPrefix="/min-sida"
            activeCoaching
            isCoach={isCoach}
            isClinicStaff={isClinicStaff}
            canBuildProgram={subscription.active}
          />
          <div className={`${shellStyles.topbar} ${styles.chatTopbar}`}>
            <div>
              <span className="eyebrow">Min sida</span>
              <h1>Chatt med coach</h1>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.headerAvatar}>
                <Image src="/om-oss/felix.jpg" alt="Felix Eliasson" fill sizes="40px" />
              </div>
              <div>
                <div className={styles.headerName}>Felix Eliasson</div>
                <div className={styles.headerSub}>
                  <span className={styles.headerDot} />
                  Svarar inom 1–2 vardagar
                </div>
              </div>
            </div>

            {profile?.drive_folder_url && (
              <a
                href={profile.drive_folder_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  padding: "10px 16px",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  borderBottom: "1px solid var(--line)",
                  color: "var(--sage)",
                  textDecoration: "none",
                }}
              >
                📁 Har du en bild eller video att dela? Lägg den i Drive-mappen →
              </a>
            )}

            <div className={styles.scroll}>
              <ChatThread messages={messagesWithUrls} />
            </div>

            <Composer />
          </div>
        </main>
      </div>
    </>
  );
}
