import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../page.module.css";

export default async function ClinicProgramListPage() {
  await requireCoach();
  const admin = createAdminClient();

  const { data: programs } = await admin
    .from("clinic_programs")
    .select("id, label, share_token, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/coaching" className={styles.back}>
          ← Coach-inkorg
        </Link>
        <span className="eyebrow">Coach-verktyg</span>
        <h1>Kundprogram</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 24 }}>
          Skräddarsydda övningsprogram du delar som länk — mottagaren behöver
          varken konto eller Premium.
        </p>

        <Link
          href="/coaching/kundprogram/ny"
          className="btn btn-primary"
          style={{ display: "inline-block", marginBottom: 28 }}
        >
          + Nytt kundprogram
        </Link>

        {!programs || programs.length === 0 ? (
          <p className={styles.empty}>Inga kundprogram skapade än.</p>
        ) : (
          <div className={styles.list}>
            {programs.map((p) => (
              <Link key={p.id} href={`/coaching/kundprogram/${p.id}`} className={styles.row}>
                <div className={styles.rowInfo}>
                  <div className={styles.name}>{p.label}</div>
                  <div className={styles.preview}>/p/{p.share_token}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
