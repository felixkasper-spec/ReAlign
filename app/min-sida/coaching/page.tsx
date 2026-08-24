import Image from "next/image";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "../Sidebar";
import MobileTabs from "../MobileTabs";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
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

  const [{ data: profile }, subscription] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    getSubscription(),
  ]);

  const hasCoaching = subscription.active && subscription.plan === "premium_coaching";
  if (!hasCoaching) {
    redirect("/min-sida");
  }

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
        />

        <main className={shellStyles.main}>
          <MobileTabs hasCoaching={hasCoaching} linkPrefix="/min-sida" activeCoaching />
          <div className={shellStyles.topbar}>
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
