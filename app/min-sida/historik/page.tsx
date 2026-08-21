import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import styles from "../page.module.css";

const PAGE_SIZE = 20;

export default async function HistorikPage({
  searchParams,
}: {
  searchParams: Promise<{ sida?: string }>;
}) {
  const { sida } = await searchParams;
  const page = Math.max(1, Number(sida) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sessions } = await supabase
    .from("logged_sessions")
    .select("id, title, notes, completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .range(from, to);

  const rows = sessions ?? [];
  const hasNext = rows.length === PAGE_SIZE;

  return (
    <>
      <Header />
      <div className="wrap">
        <section style={{ paddingTop: 40 }}>
          <span className="eyebrow">Min sida</span>
          <h1 style={{ fontSize: "2rem", margin: "14px 0 20px" }}>
            Träningshistorik
          </h1>

          {rows.length === 0 && (
            <p className={styles.empty}>Inga loggade pass ännu.</p>
          )}

          {rows.length > 0 && (
            <div className={styles.dash}>
              {rows.map((s) => (
                <div className={styles.dashRow} key={s.id} style={{ alignItems: "flex-start" }}>
                  <div>
                    <div>{s.title}</div>
                    {s.notes && (
                      <div style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginTop: 4 }}>
                        {s.notes}
                      </div>
                    )}
                  </div>
                  <span className={styles.status}>
                    {new Date(s.completed_at!).toLocaleDateString("sv-SE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            {page > 1 ? (
              <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href={`/min-sida/historik?sida=${page - 1}`}>
                ← Föregående
              </Link>
            ) : (
              <span />
            )}
            {hasNext && (
              <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href={`/min-sida/historik?sida=${page + 1}`}>
                Nästa →
              </Link>
            )}
          </div>

          <p style={{ marginTop: 30 }}>
            <Link href="/min-sida" className={styles.link}>
              ← Tillbaka till Min sida
            </Link>
          </p>
        </section>
        <Footer />
      </div>
    </>
  );
}
