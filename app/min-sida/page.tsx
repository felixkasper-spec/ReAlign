import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { getProgressionStats } from "@/lib/progression";
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

  const [{ data: favorites }, subscription, { data: programs }, { data: upcoming }, { data: recent }] =
    await Promise.all([
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
        .limit(5),
    ]);

  const progression = subscription.active
    ? await getProgressionStats(supabase, user.id)
    : null;

  return (
    <>
      <Header />
      <div className="wrap">
        <section className={styles.hero}>
          <span className="eyebrow">Min sida</span>
          <h1>Hej{user.email ? `, ${user.email}` : ""}!</h1>
          <p>Schemalägg pass, håll koll på favoriter och din prenumeration.</p>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>
              Logga ut
            </button>
          </form>
        </section>

        {checkoutMessage(checkout, subscription.active) && (
          <p className={styles.checkoutMessage}>
            {checkoutMessage(checkout, subscription.active)}
          </p>
        )}

        <section className={styles.premiumPanel}>
          {subscription.active ? (
            <>
              <span className="eyebrow" style={{ color: "var(--warm)" }}>
                Premium
              </span>
              <h3 className={styles.premiumTitle}>Din prenumeration är aktiv</h3>
              <p className={styles.premiumText}>
                Nästa förnyelse:{" "}
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString(
                      "sv-SE",
                    )
                  : "okänt datum"}
              </p>
              <form action={openBillingPortal}>
                <button
                  className="btn btn-ghost"
                  style={{ border: "1px solid var(--line)" }}
                >
                  Hantera prenumeration →
                </button>
              </form>
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
              <form action={createCheckoutSession}>
                <button className="btn btn-primary">
                  Bli Premium →
                </button>
              </form>
            </>
          )}
        </section>

        <section className={styles.progressionPanel}>
          <span className="eyebrow">Progression</span>
          <h3 className={styles.premiumTitle}>Din träning över tid</h3>
          {progression ? (
            <>
              <div className={styles.statRow}>
                <div className={styles.stat}>
                  <b>{progression.weekCount}</b>
                  <span>pass senaste 7 dagarna</span>
                </div>
                <div className={styles.stat}>
                  <b>{progression.monthCount}</b>
                  <span>pass senaste 30 dagarna</span>
                </div>
                <div className={styles.stat}>
                  <b>{progression.streak}</b>
                  <span>{progression.streak === 1 ? "dags streak" : "dagars streak"}</span>
                </div>
              </div>
              {progression.byCategory.length > 0 && (
                <div className={styles.categoryList}>
                  {progression.byCategory.map((c) => (
                    <div key={c.category} className={styles.categoryRow}>
                      <span>{categoryLabels[c.category] ?? c.category}</span>
                      <span className={styles.status}>{c.count} pass</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className={styles.premiumText}>
              Progressionsspårning ingår i Premium — se hur din träning
              utvecklas över tid, per vecka och per kategori.
            </p>
          )}
        </section>

        <section className={styles.scheduleSection}>
          <h2 className={styles.favTitle}>Schema</h2>

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
            <input type="date" name="date" required className={styles.dateInput} />
            <input type="time" name="time" required className={styles.timeInput} />
            <SubmitButton className="btn btn-primary" pendingText="Sparar...">
              Schemalägg
            </SubmitButton>
          </form>

          {upcoming && upcoming.length > 0 && (
            <div className={styles.dash}>
              {upcoming.map((s) => (
                <div className={styles.dashRow} key={s.id}>
                  <span>{s.title}</span>
                  <div className={styles.dashActions}>
                    <span className={styles.status}>
                      {formatScheduled(s.scheduled_for!)}
                    </span>
                    <form action={markSessionDone.bind(null, s.id)}>
                      <button type="submit" className={styles.iconBtn} title="Markera som klar">
                        ✓
                      </button>
                    </form>
                    <form action={deleteSession.bind(null, s.id)}>
                      <button type="submit" className={styles.iconBtn} title="Ta bort">
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recent && recent.length > 0 && (
            <>
              <h3 className={styles.subTitle}>Senast genomfört</h3>
              <div className={styles.dash}>
                {recent.map((s) => (
                  <div className={styles.dashRow} key={s.id}>
                    <span>{s.title}</span>
                    <span className={`${styles.status} ${styles.done}`}>Klar</span>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 14 }}>
                <Link href="/min-sida/historik" className={styles.link}>
                  Se all historik →
                </Link>
              </p>
            </>
          )}
        </section>

        <section className={styles.favSection}>
          <h2 className={styles.favTitle}>Favoritövningar</h2>
          {(!favorites || favorites.length === 0) && (
            <p className={styles.empty}>
              Inga sparade favoriter än.{" "}
              <a href="/ovningsbank" className={styles.link}>
                Bläddra i övningsbanken →
              </a>
            </p>
          )}
          {favorites && favorites.length > 0 && (
            <div className={styles.favGrid}>
              {favorites.map((f) => (
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

        <Footer />
      </div>
    </>
  );
}
