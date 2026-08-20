import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { createCheckoutSession, openBillingPortal } from "./actions";
import styles from "./page.module.css";

const checkoutMessages: Record<string, string> = {
  success: "Klart! Din prenumeration är aktiv.",
  cancel: "Betalningen avbröts — inget drogs från ditt kort.",
  error: "Något gick fel vid betalningen. Försök gärna igen.",
  not_configured: "Betalning är inte konfigurerat än — hör av dig till oss.",
};

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

        {checkout && checkoutMessages[checkout] && (
          <p className={styles.checkoutMessage}>{checkoutMessages[checkout]}</p>
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
