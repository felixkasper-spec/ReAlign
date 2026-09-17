import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRelativeTime } from "@/lib/relative-time";
import { getFollowUpReminder } from "@/lib/lead-followup";
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
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireCoach();
  const admin = createAdminClient();
  const { status: statusFilter, q } = await searchParams;

  const { data: allLeads } = await admin
    .from("coaching_leads")
    .select(
      "id, name, phone, email, situation, utm_source, utm_medium, utm_campaign, status, notes, created_at, status_updated_at",
    )
    .order("created_at", { ascending: false });

  const query = q?.trim().toLowerCase();
  const searched = (allLeads ?? []).filter((l) => {
    if (!query) return true;
    return (
      l.name?.toLowerCase().includes(query) ||
      l.phone?.toLowerCase().includes(query) ||
      l.email?.toLowerCase().includes(query)
    );
  });

  const noStatus = searched.filter((l) => !l.status).length;

  const counts = Object.fromEntries(
    STATUS_FILTERS.map((f) => [
      f.value,
      f.value === ""
        ? searched.length
        : f.value === "none"
          ? noStatus
          : searched.filter((l) => l.status === f.value).length,
    ]),
  );

  const leads = searched.filter((l) => {
    if (!statusFilter) return true;
    if (statusFilter === "none") return !l.status;
    return l.status === statusFilter;
  });

  function pillHref(statusValue: string) {
    const params = new URLSearchParams();
    if (statusValue) params.set("status", statusValue);
    if (q?.trim()) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/coaching/leads?${qs}` : "/coaching/leads";
  }

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

        <form
          action="/coaching/leads"
          method="get"
          style={{ display: "flex", gap: 8, marginBottom: 16, maxWidth: 340 }}
        >
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Sök namn, telefon eller mejl..."
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

        <div className={styles.leadFilterBar}>
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={pillHref(f.value)}
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
            {query || statusFilter
              ? "Inga leads matchade."
              : "Inga intresseanmälningar än."}
          </p>
        )}

        <div className={styles.list}>
          {(leads ?? []).map((l) => {
            const reminder =
              l.status === "no_answer"
                ? getFollowUpReminder(l.status_updated_at as string)
                : null;
            return (
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
                    {formatRelativeTime(l.created_at as string)}
                  </div>
                  {reminder && (
                    <div className={styles.leadFollowUpReminder}>{reminder}</div>
                  )}
                </div>
                <LeadControls
                  leadId={l.id}
                  name={l.name}
                  phone={l.phone}
                  initialStatus={l.status}
                  initialNotes={l.notes}
                />
              </div>
            );
          })}
        </div>

        <Footer />
      </div>
    </>
  );
}
