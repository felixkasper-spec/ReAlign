import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import LeadControls from "./LeadControls";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Leads — ReAlign Metoden" };

export default async function CoachingLeadsPage() {
  await requireCoach();
  const admin = createAdminClient();

  const { data: leads } = await admin
    .from("coaching_leads")
    .select(
      "id, name, phone, email, situation, utm_source, utm_medium, utm_campaign, status, notes, created_at",
    )
    .order("created_at", { ascending: false });

  const noStatus = (leads ?? []).filter((l) => !l.status).length;

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
          {noStatus > 0 ? (
            <>
              <b>{noStatus}</b> {noStatus === 1 ? "person" : "personer"} väntar
              på att hanteras.
            </>
          ) : (
            "Alla leads har en status."
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
                {(l.utm_source || l.utm_campaign) && (
                  <div className={styles.leadSource}>
                    Via {l.utm_source || "okänd källa"}
                    {l.utm_campaign && ` · ${l.utm_campaign}`}
                  </div>
                )}
                <div className={styles.contactDate}>
                  {new Date(l.created_at as string).toLocaleString("sv-SE", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </div>
              <LeadControls
                leadId={l.id}
                initialStatus={l.status}
                initialNotes={l.notes}
              />
            </div>
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}
