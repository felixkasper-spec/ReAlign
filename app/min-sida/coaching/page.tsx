import Image from "next/image";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import SubmitButton from "@/components/SubmitButton";
import Sidebar from "../Sidebar";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { sendCoachingMessage } from "../actions";
import ChatThread from "./ChatThread";
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
    .select("id, sender, body, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

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
              <ChatThread messages={coachingMessages ?? []} />
            </div>

            <form action={sendCoachingMessage} className={styles.composer}>
              <textarea
                name="body"
                placeholder="Skriv ditt meddelande..."
                required
                rows={1}
                className={styles.composerField}
              />
              <SubmitButton className={styles.sendBtn} pendingText="…">
                →
              </SubmitButton>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
