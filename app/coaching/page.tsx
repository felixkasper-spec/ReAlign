import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { markContactMessageRead } from "./actions";
import styles from "./page.module.css";

type ThreadRow = {
  userId: string;
  name: string;
  lastBody: string | null;
  lastAt: string | null;
  unread: number;
};

// Midnatt i svensk tid, uttryckt som en UTC-tidsstämpel — created_at lagras
// i UTC, så vi måste räkna ut var "idag" faktiskt börjar i rätt tidszon
// istället för att bara nollställa UTC-klockan (skulle ge fel gräns under
// sommartid och nära midnatt).
function startOfTodayStockholm(): Date {
  const now = new Date();
  const stockholmNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Stockholm" }),
  );
  const startOfDay = new Date(
    stockholmNow.getFullYear(),
    stockholmNow.getMonth(),
    stockholmNow.getDate(),
  );
  const offsetMs = now.getTime() - stockholmNow.getTime();
  return new Date(startOfDay.getTime() + offsetMs);
}

export default async function CoachingInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireCoach();
  const { q } = await searchParams;
  const admin = createAdminClient();

  const { data: newProfiles } = await admin
    .from("profiles")
    .select("email, display_name, created_at, signup_source")
    .gte("created_at", startOfTodayStockholm().toISOString())
    .order("created_at", { ascending: false });

  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id, profiles ( email, display_name )")
    .eq("plan", "premium_coaching")
    .in("status", ["active", "trialing"]);

  const { data: messages } = await admin
    .from("coaching_messages")
    .select("user_id, sender, body, created_at, read_at")
    .order("created_at", { ascending: false });

  const { data: contactMessages } = await admin
    .from("contact_messages")
    .select("id, name, email, message, created_at, read_at")
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

  const filteredThreads = q?.trim()
    ? threads.filter((t) =>
        t.name.toLowerCase().includes(q.trim().toLowerCase()),
      )
    : threads;

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <span className="eyebrow">Coach-inkorg</span>
        <h1>Premium Coaching</h1>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <Link
            href="/coaching/kundprogram"
            className="btn btn-ghost"
            style={{ border: "1px solid var(--line)" }}
          >
            Kundprogram (delade länkar) →
          </Link>
          <Link
            href="/coaching/content-studio"
            className="btn btn-ghost"
            style={{ border: "1px solid var(--line)" }}
          >
            Content Studio →
          </Link>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: (newProfiles?.length ?? 0) > 0 ? 10 : 0,
            }}
          >
            Nya konton idag: {newProfiles?.length ?? 0}
          </div>
          {(newProfiles ?? []).map((p, i) => (
            <div
              key={i}
              style={{
                fontSize: "0.85rem",
                color: "var(--text-soft)",
                padding: "4px 0",
                borderTop: i > 0 ? "1px solid var(--line)" : "none",
              }}
            >
              {p.display_name || p.email}
              {p.signup_source && (
                <span style={{ color: "var(--sage)" }}>
                  {" "}
                  · källa: {p.signup_source}
                </span>
              )}
              <span>
                {" "}
                ·{" "}
                {new Date(p.created_at as string).toLocaleTimeString("sv-SE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>

        {threads.length > 0 && (
          <form
            action="/coaching"
            method="get"
            style={{ display: "flex", gap: 8, marginBottom: 16 }}
          >
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Sök på kundnamn..."
              style={{
                flex: 1,
                border: "1px solid var(--line)",
                borderRadius: 100,
                padding: "8px 16px",
                fontSize: "0.88rem",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              className="btn btn-ghost"
              style={{ border: "1px solid var(--line)" }}
            >
              Sök
            </button>
          </form>
        )}

        {threads.length === 0 && (
          <p className={styles.empty}>
            Inga aktiva Premium Coaching-prenumeranter än.
          </p>
        )}

        {threads.length > 0 && filteredThreads.length === 0 && (
          <p className={styles.empty}>Ingen kund matchade &quot;{q}&quot;.</p>
        )}

        <div className={styles.list}>
          {filteredThreads.map((t) => (
            <Link
              key={t.userId}
              href={`/coaching/${t.userId}`}
              className={styles.row}
            >
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

        <div className={styles.contactSection}>
          <span className="eyebrow">Kontaktmeddelanden</span>
          <h2>Från kontaktformuläret</h2>

          {(!contactMessages || contactMessages.length === 0) && (
            <p className={styles.empty}>Inga kontaktmeddelanden än.</p>
          )}

          <div className={styles.list}>
            {(contactMessages ?? []).map((m) => (
              <div key={m.id} className={styles.contactRow}>
                <div className={styles.rowInfo}>
                  <div className={styles.name}>
                    {m.name}{" "}
                    <span className={styles.contactEmail}>· {m.email}</span>
                  </div>
                  <div className={styles.contactMessage}>{m.message}</div>
                  <div className={styles.contactDate}>
                    {new Date(m.created_at as string).toLocaleString("sv-SE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
                {!m.read_at && (
                  <form action={markContactMessageRead.bind(null, m.id)}>
                    <button type="submit" className={styles.markReadBtn}>
                      Markera som läst
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
