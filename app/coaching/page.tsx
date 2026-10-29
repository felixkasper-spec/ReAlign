import Link from "next/link";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { markContactMessageRead, completeFollowup } from "./actions";
import styles from "./page.module.css";

type ThreadRow = {
  userId: string;
  name: string;
  lastBody: string | null;
  lastAt: string | null;
  unread: number;
  plan: string | null;
  customerPhone: string | null;
  customerName: string | null;
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

  const todayStart = startOfTodayStockholm().toISOString();

  const { data: newProfiles } = await admin
    .from("profiles")
    .select("email, display_name, created_at, signup_source")
    .gte("created_at", todayStart)
    .order("created_at", { ascending: false });

  const { data: todaysIntakes } = await admin
    .from("coaching_intake")
    .select("user_id, submitted_at")
    .gte("submitted_at", todayStart)
    .order("submitted_at", { ascending: false });

  const intakeUserIds = (todaysIntakes ?? []).map((i) => i.user_id as string);
  const { data: intakeProfiles } =
    intakeUserIds.length > 0
      ? await admin.from("profiles").select("id, display_name, email").in("id", intakeUserIds)
      : { data: [] };
  const intakeProfileById = new Map((intakeProfiles ?? []).map((p) => [p.id, p]));

  // Manuella uppföljningspåminnelser (se FollowupScheduler i tråden) som
  // förfallit — remind_at i det förflutna och inte redan klarmarkerade.
  const { data: dueFollowupRows } = await admin
    .from("coaching_followups")
    .select("id, user_id, note, remind_at")
    .is("completed_at", null)
    .lte("remind_at", new Date().toISOString())
    .order("remind_at", { ascending: true });

  const followupUserIds = [...new Set((dueFollowupRows ?? []).map((f) => f.user_id as string))];
  const { data: followupProfiles } =
    followupUserIds.length > 0
      ? await admin.from("profiles").select("id, display_name, email").in("id", followupUserIds)
      : { data: [] };
  const followupProfileById = new Map((followupProfiles ?? []).map((p) => [p.id, p]));

  const dueFollowups = (dueFollowupRows ?? []).map((f) => {
    const profile = followupProfileById.get(f.user_id as string);
    return {
      id: f.id as string,
      userId: f.user_id as string,
      name: profile?.display_name || profile?.email || "Okänd",
      note: f.note as string | null,
      remindAt: f.remind_at as string,
    };
  });

  // Schemalagda men ännu inte förfallna påminnelser — syntes tidigare
  // ingenstans, så "Påminnelser: 0" såg ut som att schemaläggningen inte
  // sparats alls trots att den gjort det (remind_at ligger bara i
  // framtiden än).
  const { data: upcomingFollowupRows } = await admin
    .from("coaching_followups")
    .select("id, user_id, note, remind_at")
    .is("completed_at", null)
    .gt("remind_at", new Date().toISOString())
    .order("remind_at", { ascending: true });

  const upcomingFollowupUserIds = [
    ...new Set((upcomingFollowupRows ?? []).map((f) => f.user_id as string)),
  ];
  const { data: upcomingFollowupProfiles } =
    upcomingFollowupUserIds.length > 0
      ? await admin.from("profiles").select("id, display_name, email").in("id", upcomingFollowupUserIds)
      : { data: [] };
  const upcomingFollowupProfileById = new Map(
    (upcomingFollowupProfiles ?? []).map((p) => [p.id, p]),
  );

  const upcomingFollowups = (upcomingFollowupRows ?? []).map((f) => {
    const profile = upcomingFollowupProfileById.get(f.user_id as string);
    return {
      id: f.id as string,
      userId: f.user_id as string,
      name: profile?.display_name || profile?.email || "Okänd",
      note: f.note as string | null,
      remindAt: f.remind_at as string,
    };
  });

  const { data: messages } = await admin
    .from("coaching_messages")
    .select("user_id, sender, body, created_at, read_at")
    .order("created_at", { ascending: false });

  const { data: contactMessages } = await admin
    .from("contact_messages")
    .select("id, name, email, message, created_at, read_at")
    .order("created_at", { ascending: false });

  // Trådlistan byggs från VILKA SOM HELST som skrivit ett meddelande, inte
  // bara aktiva Premium Coaching-prenumeranter — chatten är öppen för alla
  // inloggade användare (se app/min-sida/coaching/page.tsx), bland annat
  // för att kunna svara fysiska klinikkunder som kopplat sitt inlogg via
  // customers-tabellen (se kundens sida i adminverktyget) men inte
  // nödvändigtvis har en aktiv prenumeration.
  const userIds = [...new Set((messages ?? []).map((m) => m.user_id as string))];

  const [{ data: profiles }, { data: subs }, { data: linkedCustomers }] =
    userIds.length > 0
      ? await Promise.all([
          admin.from("profiles").select("id, email, display_name").in("id", userIds),
          admin.from("subscriptions").select("user_id, plan, status").in("user_id", userIds),
          admin.from("customers").select("phone, name, linked_user_id").in("linked_user_id", userIds),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const planByUserId = new Map(
    (subs ?? [])
      .filter((s) => s.status === "active" || s.status === "trialing")
      .map((s) => [s.user_id, s.plan as string]),
  );
  const customerByUserId = new Map(
    (linkedCustomers ?? []).map((c) => [c.linked_user_id as string, c]),
  );

  const threads: ThreadRow[] = userIds.map((userId) => {
    const profile = profileById.get(userId);
    const msgs = (messages ?? []).filter((m) => m.user_id === userId);
    const last = msgs[0];
    const unread = msgs.filter((m) => m.sender === "user" && !m.read_at).length;
    const linkedCustomer = customerByUserId.get(userId);

    return {
      userId,
      name: profile?.display_name || profile?.email || userId,
      lastBody: last?.body ?? null,
      lastAt: (last?.created_at as string | undefined) ?? null,
      unread,
      plan: planByUserId.get(userId) ?? null,
      customerPhone: linkedCustomer?.phone ?? null,
      customerName: linkedCustomer?.name ?? null,
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
    <div className={`wrap ${styles.wrap}`}>
      <span className="eyebrow">Admin</span>
      <h1>Meddelanden</h1>

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
            href="/coaching/leads"
            className="btn btn-ghost"
            style={{ border: "1px solid var(--line)" }}
          >
            Leads →
          </Link>
          <Link
            href="/coaching/intag"
            className="btn btn-ghost"
            style={{ border: "1px solid var(--line)" }}
          >
            Kom igång-formulär →
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
              marginBottom: (todaysIntakes?.length ?? 0) > 0 ? 10 : 0,
            }}
          >
            Inskickade formulär idag: {todaysIntakes?.length ?? 0}
          </div>
          {(todaysIntakes ?? []).map((intake, i) => {
            const profile = intakeProfileById.get(intake.user_id as string);
            return (
              <div
                key={i}
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-soft)",
                  padding: "4px 0",
                  borderTop: i > 0 ? "1px solid var(--line)" : "none",
                }}
              >
                <Link href={`/coaching/${intake.user_id}`}>
                  {profile?.display_name || profile?.email || "Okänd"}
                </Link>
                <span>
                  {" "}
                  ·{" "}
                  {new Date(intake.submitted_at as string).toLocaleTimeString("sv-SE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
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
              marginBottom: dueFollowups.length > 0 ? 10 : 0,
            }}
          >
            Påminnelser: {dueFollowups.length}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dueFollowups.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  fontSize: "0.88rem",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                <span>
                  <Link href={`/coaching/${f.userId}`}>{f.name}</Link>
                  {f.note ? ` — ${f.note}` : ""}
                  <span style={{ color: "var(--text-soft)" }}>
                    {" "}
                    · skulle höras av {new Date(f.remindAt).toLocaleDateString("sv-SE", { dateStyle: "medium" })}
                  </span>
                </span>
                <form action={completeFollowup.bind(null, f.id, f.userId)}>
                  <button type="submit" className="btn btn-ghost" style={{ border: "1px solid var(--line)", flexShrink: 0 }}>
                    Klar
                  </button>
                </form>
              </div>
            ))}
          </div>

          {upcomingFollowups.length > 0 && (
            <details style={{ marginTop: dueFollowups.length > 0 ? 14 : 0 }}>
              <summary style={{ cursor: "pointer", color: "var(--text-soft)", fontSize: "0.88rem" }}>
                Kommande påminnelser ({upcomingFollowups.length})
              </summary>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {upcomingFollowups.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      fontSize: "0.88rem",
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <span>
                      <Link href={`/coaching/${f.userId}`}>{f.name}</Link>
                      {f.note ? ` — ${f.note}` : ""}
                      <span style={{ color: "var(--text-soft)" }}>
                        {" "}
                        · hörs av {new Date(f.remindAt).toLocaleDateString("sv-SE", { dateStyle: "medium" })}
                      </span>
                    </span>
                    <form action={completeFollowup.bind(null, f.id, f.userId)}>
                      <button type="submit" className="btn btn-ghost" style={{ border: "1px solid var(--line)", flexShrink: 0 }}>
                        Klar
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </details>
          )}
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
          <p className={styles.empty}>Inga meddelanden än.</p>
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
                <div className={styles.name}>
                  {t.name}
                  {t.plan === "premium_coaching" && (
                    <span className={styles.leadOwnerBadge} style={{ marginLeft: 8 }}>
                      Premium Coaching
                    </span>
                  )}
                  {t.customerPhone && (
                    <span className={styles.leadOwnerBadge} style={{ marginLeft: 8 }}>
                      {t.customerName ? `Kund: ${t.customerName}` : "Kopplad kund"}
                    </span>
                  )}
                </div>
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
    </div>
  );
}
