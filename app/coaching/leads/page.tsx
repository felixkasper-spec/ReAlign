import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import LeadControls from "./LeadControls";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Leads — ReAlign Metoden" };

const STATUS_FILTERS = [
  { value: "", label: "Alla" },
  { value: "none", label: "Ingen status" },
  { value: "no_answer", label: "Inget svar / ring igen" },
  { value: "not_interested", label: "Ej intresserad" },
  { value: "purchased", label: "Köpt" },
  { value: "follow_up", label: "Följ upp" },
] as const;

export default async function CoachingLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireCoach();
  const admin = createAdminClient();
  const { status: statusFilter } = await searchParams;

  const { data: allLeads } = await admin
    .from("coaching_leads")
    .select(
      "id, name, phone, email, situation, utm_source, utm_medium, utm_campaign, status, notes, created_at",
    )
    .order("created_at", { ascending: false });

  const noStatus = (allLeads ?? []).filter((l) => !l.status).length;

  const counts = Object.fromEntries(
    STATUS_FILTERS.map((f) => [
      f.value,
      f.value === ""
        ? (allLeads ?? []).length
        : f.value === "none"
          ? noStatus
          : (allLeads ?? []).filter((l) => l.status === f.value).length,
    ]),
  );

  const leads = (allLeads ?? []).filter((l) => {
    if (!statusFilter) return true;
    if (statusFilter === "none") return !l.status;
    return l.status === statusFilter;
  });

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

        <div className={styles.leadFilterBar}>
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/coaching/leads?status=${f.value}` : "/coaching/leads"}
              data-status={f.value || undefined}
              data-active={(statusFilter ?? "") === f.value || undefined}
              className={styles.leadFilterPill}
            >
              {f.label} <span>{counts[f.value]}</span>
            </Link>
          ))}
        </div>

        {leads.length === 0 && (
          <p className={styles.empty}>
            {statusFilter
              ? "Inga leads med den här statusen."
              : "Inga intresseanmälningar än."}
          </p>
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
                name={l.name}
                phone={l.phone}
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
