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

  return (
    <>
      <Header />
      <div className="wrap">
        <section className={styles.hero}>
          <span className="eyebrow">Min sida</span>
          <h1>Hej{user.email ? `, ${user.email}` : ""}!</h1>
          <p>
            Favoriter, schema och träningslogg landar här i nästa steg av
            utbyggnaden.
          </p>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>
              Logga ut
            </button>
          </form>
        </section>
        <Footer />
      </div>
    </>
  );
}
