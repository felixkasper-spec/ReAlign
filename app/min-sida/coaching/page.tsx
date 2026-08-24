import { redirect } from "next/navigation";
import Header from "@/components/Header";
import SubmitButton from "@/components/SubmitButton";
import Sidebar from "../Sidebar";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { sendCoachingMessage } from "../actions";
import styles from "../page.module.css";

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
      <div className={styles.shell}>
        <Sidebar
          firstName={firstName}
          userEmail={user.email}
          hasCoaching={hasCoaching}
          linkPrefix="/min-sida"
          activeCoaching
        />

        <main className={styles.main}>
          <div className={styles.topbar}>
            <div>
              <span className="eyebrow">Min sida</span>
              <h1>Chatt med coach</h1>
              <p>
                Fråga om övningar, upplägg eller hur du känner dig — vi
                svarar inom 1–2 vardagar.
              </p>
            </div>
          </div>

          <div className={styles.chatWrap}>
            <section className={styles.panel}>
              <div className={styles.coachThread}>
                {(!coachingMessages || coachingMessages.length === 0) && (
                  <p className={styles.empty}>
                    Inga meddelanden än — skriv din första fråga nedan.
                  </p>
                )}
                {coachingMessages?.map((m) => (
                  <div
                    key={m.id}
                    className={`${styles.coachMsg} ${
                      m.sender === "coach" ? styles.coachMsgCoach : styles.coachMsgUser
                    }`}
                  >
                    <span className={styles.coachMsgMeta}>
                      {m.sender === "coach" ? "Coach" : "Du"} ·{" "}
                      {new Date(m.created_at as string).toLocaleDateString(
                        "sv-SE",
                        { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" },
                      )}
                    </span>
                    <p>{m.body}</p>
                  </div>
                ))}
              </div>
              <form action={sendCoachingMessage} className={styles.scheduleForm}>
                <textarea
                  name="body"
                  placeholder="Skriv ditt meddelande..."
                  required
                  rows={3}
                  className={styles.textInput}
                />
                <SubmitButton className="btn btn-primary" pendingText="Skickar...">
                  Skicka →
                </SubmitButton>
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
