import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { markLeadContacted } from "./actions";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Leads — ReAlign Metoden" };

export default async function CoachingLeadsPage() {
  await requireCoach();
  const admin = createAdminClient();

  const { data: leads } = await admin
    .from("coaching_leads")
    .select("id, name, phone, email, situation, contacted_at, created_at")
    .order("created_at", { ascending: false });

  const notContacted = (leads ?? []).filter((l) => !l.contacted_at).length;

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/coaching" className={styles.back}>
          ← Coach-inkorg
        </Link>
        <span className="eyebrow">Intresseanmälningar</span>
        <h1>Leads — Premium Coaching</h1>
        <p
          style={{
            color: "var(--text-soft)",
            fontSize: "0.88rem",
            marginBottom: 24,
          }}
        >
          {notContacted > 0 ? (
            <>
              <b>{notContacted}</b> {notContacted === 1 ? "person" : "personer"}{" "}
              väntar på att bli uppringda.
            </>
          ) : (
            "Alla leads är kontaktade."
          )}
        </p>

        {(!leads || leads.length === 0) && (
          <p className={styles.empty}>Inga intresseanmälningar än.</p>
        )}

        <div className={styles.list}>
          {(leads ?? []).map((l) => (
            <div key={l.id} className={styles.contactRow}>
              <div className={styles.rowInfo}>
                <div className={styles.name}>
                  {l.name}{" "}
                  <a href={`tel:${l.phone}`} className={styles.contactEmail}>
                    · {l.phone}
                  </a>
                  {l.email && (
                    <span className={styles.contactEmail}> · {l.email}</span>
                  )}
                </div>
                {l.situation && (
                  <div className={styles.contactMessage}>{l.situation}</div>
                )}
                <div className={styles.contactDate}>
                  {new Date(l.created_at as string).toLocaleString("sv-SE", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                  {l.contacted_at && (
                    <>
                      {" "}
                      · kontaktad{" "}
                      {new Date(l.contacted_at as string).toLocaleString(
                        "sv-SE",
                        {
                          dateStyle: "short",
                          timeStyle: "short",
                        },
                      )}
                    </>
                  )}
                </div>
              </div>
              {!l.contacted_at && (
                <form action={markLeadContacted.bind(null, l.id)}>
                  <button type="submit" className={styles.markReadBtn}>
                    Markera som kontaktad
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}
