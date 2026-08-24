import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { replyToCoachingThread } from "../actions";
import styles from "../page.module.css";

export default async function CoachingThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  await requireCoach();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: messages } = await admin
    .from("coaching_messages")
    .select("id, sender, body, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  await admin
    .from("coaching_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("sender", "user")
    .is("read_at", null);

  const reply = replyToCoachingThread.bind(null, userId);
  const displayName = profile.display_name || profile.email;

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/coaching" className={styles.back}>
          ← Alla trådar
        </Link>
        <span className="eyebrow">Premium Coaching</span>
        <h1>{displayName}</h1>

        <div className={styles.thread}>
          {(!messages || messages.length === 0) && (
            <p className={styles.empty}>Inga meddelanden än.</p>
          )}
          {messages?.map((m) => (
            <div
              key={m.id}
              className={`${styles.msg} ${
                m.sender === "coach" ? styles.msgCoach : styles.msgUser
              }`}
            >
              <span className={styles.msgMeta}>
                {m.sender === "coach" ? "Coach" : displayName} ·{" "}
                {new Date(m.created_at as string).toLocaleString("sv-SE")}
              </span>
              <p>{m.body}</p>
            </div>
          ))}
        </div>

        <form action={reply} className={styles.replyForm}>
          <textarea
            name="body"
            placeholder="Skriv ditt svar..."
            required
            rows={4}
            className={styles.textInput}
          />
          <SubmitButton className="btn btn-primary" pendingText="Skickar...">
            Svara →
          </SubmitButton>
        </form>

        <Footer />
      </div>
    </>
  );
}
