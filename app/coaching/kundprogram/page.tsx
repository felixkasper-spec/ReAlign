import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Kundprogram — ReAlign Metoden" };

export default async function ClinicProgramListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireClinicStaff();
  const isCoach = user.email === process.env.COACH_EMAIL;
  const { q } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("clinic_programs")
    .select("id, label, share_token, created_at, visit_count, last_visited_at")
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    query = query.ilike("label", `%${q.trim()}%`);
  }

  const { data: programs } = await query;

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        {isCoach && (
          <Link href="/coaching" className={styles.back}>
            ← Coach-inkorg
          </Link>
        )}
        <span className="eyebrow">Coach-verktyg</span>
        <h1>Kundprogram</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 24 }}>
          Skräddarsydda övningsprogram du delar som länk — mottagaren behöver
          varken konto eller Premium.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
          <Link href="/coaching/kundprogram/ny" className="btn btn-primary">
            + Nytt kundprogram
          </Link>
          <form
            action="/coaching/kundprogram"
            method="get"
            style={{ display: "flex", gap: 8, flex: 1, minWidth: 200 }}
          >
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Sök på namn..."
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
        </div>

        {!programs || programs.length === 0 ? (
          <p className={styles.empty}>
            {q ? `Inga kundprogram matchade "${q}".` : "Inga kundprogram skapade än."}
          </p>
        ) : (
          <div className={styles.list}>
            {programs.map((p) => (
              <Link key={p.id} href={`/coaching/kundprogram/${p.id}`} className={styles.row}>
                <div className={styles.rowInfo}>
                  <div className={styles.name}>{p.label}</div>
                  <div className={styles.preview}>
                    /p/{p.share_token}
                    {p.visit_count > 0 && (
                      <>
                        {" "}
                        · öppnad {p.visit_count} ggr, senast{" "}
                        {new Date(p.last_visited_at as string).toLocaleString("sv-SE", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </>
                    )}
                  </div>
                </div>
                {p.visit_count === 0 && <span className={styles.badge}>Ej öppnad</span>}
              </Link>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
