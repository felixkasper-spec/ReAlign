import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";
import DatePicker from "@/components/DatePicker";
import TimePicker from "@/components/TimePicker";
import ShareButton from "./ShareButton";
import Sidebar from "./Sidebar";
import MobileTabs from "./MobileTabs";
import WeeklyTrendChart from "@/components/WeeklyTrendChart";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { getProgressionStats, streakMilestone } from "@/lib/progression";
import { getBaseUrl } from "@/lib/base-url";
import { createCheckoutSession, openBillingPortal } from "./actions";
import {
  scheduleSession,
  logSessionNow,
  markSessionDone,
  deleteSession,
} from "./schedule-actions";
import styles from "./page.module.css";

const categoryLabels: Record<string, string> = {
  helkropp: "Helkropp",
  hofter: "Höft & bäcken",
  "axlar-nacke-skulderblad": "Axlar/nacke/skulderblad",
  gym: "Gymträning",
  bal: "Bålträning",
  kontorsvardag: "Kontorsvardag",
};

const weekdayLabels = ["MÅN", "TIS", "ONS", "TOR", "FRE", "LÖR", "SÖN"];

function getMonday(d: Date) {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

function formatScheduled(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (isToday) return `Idag ${time}`;
  return (
    date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) +
    ` ${time}`
  );
}

function checkoutMessage(checkout: string | undefined, active: boolean) {
  switch (checkout) {
    case "success":
      // Stripe bekräftar att betalningen gick igenom, men vår egen
      // webhook kan ta några sekunder på sig att skriva klart i
      // databasen — påstå därför inte "aktiv" förrän vi verkligen ser
      // det i subscription.active.
      return active
        ? "Klart! Din prenumeration är aktiv."
        : "Betalningen gick igenom — det kan ta någon minut innan kontot uppdateras här.";
    case "cancel":
      return "Betalningen avbröts — inget drogs från ditt kort.";
    case "error":
      return "Något gick fel vid betalningen. Försök gärna igen.";
    case "not_configured":
      return "Betalning är inte konfigurerat än — hör av dig till oss.";
    default:
      return null;
  }
}

export default async function MinSidaPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return (
      <>
        <Header />
        <div className="wrap">
          <section className={styles.hero}>
            <span className="eyebrow">Min sida</span>
            <h1>Supabase är inte anslutet än</h1>
            <p>
              Lägg till <code>NEXT_PUBLIC_SUPABASE_URL</code> och{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> i <code>.env.local</code>{" "}
              (se <code>.env.example</code>) för att aktivera konton.
            </p>
          </section>
          <Footer />
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const monday = getMonday(new Date());
  const weekEnd = new Date(monday);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);
  const todayKey = new Date().toISOString().slice(0, 10);

  const [
    { data: profile },
    { data: favorites },
    subscription,
    { data: programs },
    { data: upcoming },
    { data: recent },
    { data: weekSessions },
  ] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase
      .from("favorites")
      .select("exercise_id, exercises ( id, slug, title, body_part )")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    getSubscription(),
    supabase.from("programs").select("id, title").order("title"),
    supabase
      .from("logged_sessions")
      .select("id, title, scheduled_for")
      .eq("user_id", user.id)
      .is("completed_at", null)
      .not("scheduled_for", "is", null)
      .order("scheduled_for", { ascending: true }),
    supabase
      .from("logged_sessions")
      .select("id, title, completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(4),
    supabase
      .from("logged_sessions")
      .select("completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .gte("completed_at", monday.toISOString())
      .lt("completed_at", weekEnd.toISOString()),
  ]);

  const progression = await getProgressionStats(supabase, user.id);

  const hasCoaching = subscription.active && subscription.plan === "premium_coaching";
  const isCoach = !!user.email && user.email === process.env.COACH_EMAIL;

  const doneDays = new Set(
    (weekSessions ?? []).map((s) => (s.completed_at as string).slice(0, 10)),
  );
  const weekGrid = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setUTCDate(date.getUTCDate() + i);
    const key = date.toISOString().slice(0, 10);
    return {
      label: weekdayLabels[i],
      isToday: key === todayKey,
      isDone: doneDays.has(key),
    };
  });

  const firstName = profile?.display_name?.trim();
  const nextUp = upcoming && upcoming.length > 0 ? upcoming[0] : null;
  const baseUrl = await getBaseUrl();

  return (
    <>
      <Header />
      <div className={styles.shell}>
      <Sidebar
        firstName={firstName}
        userEmail={user.email}
        hasCoaching={hasCoaching}
        isCoach={isCoach}
      />

      <main className={styles.main}>
        <MobileTabs hasCoaching={hasCoaching} isCoach={isCoach} />
        <div className={styles.topbar} id="oversikt">
          <div>
            <span className="eyebrow">Min sida</span>
            <h1>Hej{firstName ? `, ${firstName}` : ""} 👋</h1>
            <p>
              {progression.weekCount > 0
                ? `Du har tränat ${progression.weekCount} ${
                    progression.weekCount === 1 ? "gång" : "gånger"
                  } denna vecka. Bra jobbat.`
                : "Inga pass loggade denna vecka än — dags att komma igång."}
            </p>
          </div>
          <a href="#schema" className="btn btn-primary">
            + Logga pass
          </a>
        </div>

        {checkoutMessage(checkout, subscription.active) && (
          <p className={styles.checkoutMessage}>
            {checkoutMessage(checkout, subscription.active)}
          </p>
        )}

        <div className={styles.statRow}>
          <div className={styles.stat}>
            <span className="eyebrow">Streak</span>
            <div className={styles.statVal}>
              {progression.streak}{" "}
              <span>{progression.streak === 1 ? "dag" : "dagar"}</span>
            </div>
            {streakMilestone(progression.streak) && (
              <div className={styles.streakBadge}>
                🔥 {streakMilestone(progression.streak)} dagar i rad
              </div>
            )}
          </div>
          <div className={styles.stat}>
            <span className="eyebrow">Denna vecka</span>
            <div className={styles.statVal}>
              {progression.weekCount} <span>pass</span>
            </div>
          </div>
          <div className={styles.stat}>
            <span className="eyebrow">Favoriter</span>
            <div className={styles.statVal}>
              {favorites?.length ?? 0} <span>övningar</span>
            </div>
          </div>
          <div className={styles.stat}>
            <span className="eyebrow">Schemalagt</span>
            <div className={styles.statVal}>
              {upcoming?.length ?? 0} <span>kommande</span>
            </div>
          </div>
        </div>

        <div className={styles.cols}>
          <div>
            <section className={styles.panel} id="schema">
              <div className={styles.panelHead}>
                <h2>Den här veckan</h2>
              </div>
              <div className={styles.week}>
                {weekGrid.map((day, i) => (
                  <div
                    key={i}
                    className={`${styles.day} ${day.isToday ? styles.dayToday : day.isDone ? styles.dayDone : ""}`}
                  >
                    <span className={styles.d}>{day.label}</span>
                    <span className={styles.dot} />
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <h2>Logga ett pass</h2>
              </div>

              <form action={logSessionNow} className={styles.scheduleForm}>
                <input
                  type="text"
                  name="title"
                  placeholder="Logga ett pass du redan gjort..."
                  required
                  className={styles.textInput}
                />
                <input
                  type="text"
                  name="notes"
                  placeholder="Kommentar (valfritt)"
                  className={styles.textInput}
                />
                <SubmitButton
                  className="btn btn-ghost"
                  style={{ border: "1px solid var(--line)" }}
                  pendingText="Loggar..."
                >
                  Logga nu
                </SubmitButton>
              </form>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <h2>Schemalägg ett pass</h2>
              </div>

              <form action={scheduleSession} className={styles.scheduleForm}>
                <select name="programId" className={styles.select} defaultValue="">
                  <option value="">Eget pass...</option>
                  {(programs ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="title"
                  placeholder="Namn på passet"
                  required
                  className={styles.textInput}
                />
                <DatePicker name="date" required />
                <TimePicker name="time" required />
                <SubmitButton className="btn btn-primary" pendingText="Sparar...">
                  Schemalägg
                </SubmitButton>
              </form>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <h2>Senaste aktivitet</h2>
                {recent && recent.length > 0 && (
                  <Link href="/min-sida/historik" className={styles.link}>
                    Se allt →
                  </Link>
                )}
              </div>

              {!nextUp && (!recent || recent.length === 0) && (
                <p className={styles.empty}>
                  Inget loggat eller schemalagt än — kom igång ovan.
                </p>
              )}

              {nextUp && (
                <div className={styles.logItem}>
                  <div className={`${styles.logIcon} ${styles.logIconWarm}`}>
                    ▶
                  </div>
                  <div className={styles.logInfo}>
                    <div className={styles.t}>{nextUp.title}</div>
                    <div className={styles.s}>
                      {formatScheduled(nextUp.scheduled_for!)} · Schemalagt
                    </div>
                  </div>
                  <div className={styles.dashActions}>
                    <span className={`${styles.logStatus} ${styles.logStatusPending}`}>
                      Väntar
                    </span>
                    <form action={markSessionDone.bind(null, nextUp.id)}>
                      <button
                        type="submit"
                        className={styles.iconBtn}
                        title="Markera som klar"
                      >
                        ✓
                      </button>
                    </form>
                    <form action={deleteSession.bind(null, nextUp.id)}>
                      <button
                        type="submit"
                        className={styles.iconBtn}
                        title="Ta bort"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {recent?.map((s) => (
                <div className={styles.logItem} key={s.id}>
                  <div className={styles.logIcon}>✓</div>
                  <div className={styles.logInfo}>
                    <div className={styles.t}>{s.title}</div>
                    <div className={styles.s}>
                      {new Date(s.completed_at as string).toLocaleDateString(
                        "sv-SE",
                        { day: "numeric", month: "short" },
                      )}
                    </div>
                  </div>
                  <span className={styles.logStatus}>Klar</span>
                </div>
              ))}
            </section>
          </div>

          <div>
            <section className={styles.panel} id="favoriter">
              <div className={styles.panelHead}>
                <h2>Favoritövningar</h2>
                {favorites && favorites.length > 0 && (
                  <Link href="/ovningsbank" className={styles.link}>
                    Se alla →
                  </Link>
                )}
              </div>
              {(!favorites || favorites.length === 0) && (
                <p className={styles.empty}>
                  Inga sparade favoriter än.{" "}
                  <Link href="/ovningsbank" className={styles.link}>
                    Bläddra i övningsbanken →
                  </Link>
                </p>
              )}
              {favorites && favorites.length > 0 && (
                <div className={styles.favGrid}>
                  {favorites.slice(0, 4).map((f) => (
                    <div key={f.exercise_id} className={styles.favCard}>
                      <span className={styles.favHeart}>♥</span>
                      <span className={styles.favName}>
                        {(f.exercises as unknown as { title: string })?.title}
                      </span>
                      <span className={styles.favMeta}>
                        {(f.exercises as unknown as { body_part: string })
                          ?.body_part}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section
              className={styles.panel}
              style={{ background: "var(--sage)", border: "none" }}
            >
              <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
                Redo för nästa steg?
              </span>
              <h3
                style={{
                  color: "#fff",
                  fontSize: "1.1rem",
                  margin: "8px 0 8px",
                  fontWeight: 500,
                }}
              >
                Boka en videosamtals-analys
              </h3>
              <p style={{ color: "#DCE4DA", fontSize: "0.85rem", marginBottom: 10 }}>
                Få ett program skräddarsytt exakt för din kropp, byggt av en
                av våra terapeuter på kliniken efter ett videosamtal med dig.
              </p>
              <Link
                className="btn btn-primary"
                style={{ width: "100%", textAlign: "center", display: "block" }}
                href="/videosamtal"
              >
                Boka videosamtal – 590 kr →
              </Link>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: "0.78rem",
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                ✓ Går att betala med friskvårdsbidrag
              </p>
            </section>

            <section
              className={styles.panel}
              id="premium"
              style={
                subscription.active
                  ? undefined
                  : { border: "1px solid var(--warm)", background: "var(--warm-soft)" }
              }
            >
              {subscription.active && subscription.plan === "premium_coaching" ? (
                <>
                  <span className="eyebrow" style={{ color: "var(--warm)" }}>
                    Premium Coaching
                  </span>
                  <h3 className={styles.premiumTitle}>
                    Din prenumeration är aktiv
                  </h3>
                  <p className={styles.premiumText}>
                    Nästa förnyelse:{" "}
                    {subscription.currentPeriodEnd
                      ? new Date(
                          subscription.currentPeriodEnd,
                        ).toLocaleDateString("sv-SE")
                      : "okänt datum"}
                  </p>
                  <Link href="/min-sida/coaching" className="btn btn-ghost" style={{ width: "100%", textAlign: "center", display: "block", border: "1px solid var(--line)", marginBottom: 8 }}>
                    Till chatten →
                  </Link>
                  <form action={openBillingPortal}>
                    <button
                      className="btn btn-ghost"
                      style={{ width: "100%", border: "1px solid var(--line)" }}
                    >
                      Hantera prenumeration →
                    </button>
                  </form>
                </>
              ) : subscription.active ? (
                <>
                  <span className="eyebrow" style={{ color: "var(--warm)" }}>
                    Premium
                  </span>
                  <h3 className={styles.premiumTitle}>
                    Din prenumeration är aktiv
                  </h3>
                  <p className={styles.premiumText}>
                    Nästa förnyelse:{" "}
                    {subscription.currentPeriodEnd
                      ? new Date(
                          subscription.currentPeriodEnd,
                        ).toLocaleDateString("sv-SE")
                      : "okänt datum"}
                  </p>
                  <form action={openBillingPortal}>
                    <button
                      className="btn btn-ghost"
                      style={{ width: "100%", border: "1px solid var(--line)" }}
                    >
                      Hantera prenumeration →
                    </button>
                  </form>
                  <div style={{ borderTop: "1px solid var(--line)", marginTop: 16, paddingTop: 16 }}>
                    <p className={styles.premiumText} style={{ marginBottom: 8 }}>
                      Vill du ha direktkontakt med en coach?
                    </p>
                    <Link
                      href="/premium-coaching"
                      className="btn btn-ghost"
                      style={{ width: "100%", textAlign: "center", display: "block", border: "1px solid var(--warm)", color: "var(--warm)" }}
                    >
                      Läs mer om Premium Coaching →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <span className="eyebrow" style={{ color: "var(--warm)" }}>
                    Uppgradera
                  </span>
                  <h3 className={styles.premiumTitle}>Bli Premium</h3>
                  <p className={styles.premiumText}>
                    Lås upp alla programnivåer, Gymträning, progressionsspårning
                    och veckobrev.
                  </p>
                  <p className={styles.premiumPrice}>149 kr/mån</p>
                  <form action={createCheckoutSession.bind(null, "premium")}>
                    <button
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                    >
                      Bli Premium →
                    </button>
                  </form>
                  <p style={{ color: "var(--sage)", fontSize: "0.78rem", marginTop: 10, marginBottom: 16 }}>
                    ✓ Går att betala med friskvårdsbidrag
                  </p>
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                    <p className={styles.premiumText} style={{ marginBottom: 8 }}>
                      Vill du ha direktkontakt med en coach via chatt? Läs om{" "}
                      <Link href="/premium-coaching" style={{ color: "var(--warm)" }}>
                        Premium Coaching
                      </Link>{" "}
                      – 449 kr/mån.
                    </p>
                  </div>
                </>
              )}
            </section>

            <section className={styles.panel} id="progression">
              <span className="eyebrow">Progression</span>
              <h3 className={styles.premiumTitle}>Din träning över tid</h3>
              {subscription.active ? (
                <>
                  <WeeklyTrendChart weeks={progression.weeklyTrend} />
                  {progression.byCategory.length > 0 ? (
                    <div className={styles.categoryList}>
                      <div className={styles.categoryRow}>
                        <span>Senaste 30 dagarna</span>
                        <span className={styles.status}>
                          {progression.monthCount} pass
                        </span>
                      </div>
                      {progression.byCategory.map((c) => (
                        <div key={c.category} className={styles.categoryRow}>
                          <span>{categoryLabels[c.category] ?? c.category}</span>
                          <span className={styles.status}>{c.count} pass</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.premiumText}>
                      Inga pass kopplade till program loggade än — kör ett
                      program för att se fördelningen här.
                    </p>
                  )}
                </>
              ) : (
                <p className={styles.premiumText}>
                  Detaljerad progression per kategori ingår i Premium — se
                  hur din träning fördelar sig över tid.
                </p>
              )}
            </section>

            <section className={styles.panel} style={{ textAlign: "center" }}>
              <span className="eyebrow">Gillar du ReAlign Metoden?</span>
              <h3
                style={{
                  fontSize: "1.05rem",
                  margin: "8px 0 10px",
                  fontWeight: 500,
                }}
              >
                Tipsa en vän
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-soft)",
                  marginBottom: 16,
                }}
              >
                Dela länken så kan de börja träna gratis, precis som du.
              </p>
              <ShareButton url={baseUrl} />
            </section>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
