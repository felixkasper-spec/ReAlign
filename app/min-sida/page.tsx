import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { createCheckoutSession, openBillingPortal } from "./actions";
import styles from "./page.module.css";

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

  const [{ data: favorites }, subscription] = await Promise.all([
    supabase
      .from("favorites")
      .select("exercise_id, exercises ( id, slug, title, body_part )")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    getSubscription(),
  ]);

  return (
    <>
      <Header />
      <div className="wrap">
        <section className={styles.hero}>
          <span className="eyebrow">Min sida</span>
          <h1>Hej{user.email ? `, ${user.email}` : ""}!</h1>
          <p>Schema och träningslogg landar här i nästa steg av utbyggnaden.</p>
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
