import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

export default async function MinSidaPage() {
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

  const { data: favorites } = await supabase
    .from("favorites")
    .select("exercise_id, exercises ( id, slug, title, body_part )")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
