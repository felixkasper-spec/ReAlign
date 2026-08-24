import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "./page.module.css";

type ThreadRow = {
  userId: string;
  name: string;
  lastBody: string | null;
  lastAt: string | null;
  unread: number;
};

export default async function CoachingInboxPage() {
  await requireCoach();
  const admin = createAdminClient();

  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id, profiles ( email, display_name )")
    .eq("plan", "premium_coaching")
    .in("status", ["active", "trialing"]);

  const { data: messages } = await admin
    .from("coaching_messages")
    .select("user_id, sender, body, created_at, read_at")
    .order("created_at", { ascending: false });

  const threads: ThreadRow[] = (subs ?? []).map((s) => {
    const profile = s.profiles as unknown as {
      email: string;
      display_name: string | null;
    } | null;
    const msgs = (messages ?? []).filter((m) => m.user_id === s.user_id);
    const last = msgs[0];
    const unread = msgs.filter((m) => m.sender === "user" && !m.read_at).length;

    return {
      userId: s.user_id as string,
      name: profile?.display_name || profile?.email || s.user_id,
      lastBody: last?.body ?? null,
      lastAt: (last?.created_at as string | undefined) ?? null,
      unread,
    };
  });

  threads.sort((a, b) => {
    if (a.unread !== b.unread) return b.unread - a.unread;
    if (!a.lastAt) return 1;
    if (!b.lastAt) return -1;
    return b.lastAt.localeCompare(a.lastAt);
  });

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <span className="eyebrow">Coach-inkorg</span>
        <h1>Premium Coaching</h1>

        {threads.length === 0 && (
          <p className={styles.empty}>
            Inga aktiva Premium Coaching-prenumeranter än.
          </p>
        )}

        <div className={styles.list}>
          {threads.map((t) => (
            <Link key={t.userId} href={`/coaching/${t.userId}`} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.name}>{t.name}</div>
                <div className={styles.preview}>
                  {t.lastBody ?? "Inga meddelanden än"}
                </div>
              </div>
              {t.unread > 0 && <span className={styles.badge}>{t.unread}</span>}
            </Link>
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}
