import type { Metadata } from "next";
import Link from "next/link";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRelativeTime } from "@/lib/relative-time";
import { getFollowUpReminder } from "@/lib/lead-followup";
import { getCurrentLeadOwner, LEAD_OWNER_LABELS } from "@/lib/lead-owner";
import { setActiveLeadOwner } from "./actions";
import LeadControls from "./LeadControls";
import AutoRefresh from "./AutoRefresh";
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

const STATUS_LABELS: Record<string, string> = {
  no_answer: "Inget svar",
  not_interested: "Ej intresserad",
  purchased: "Köpt",
  follow_up: "Följ upp",
};

const OWNER_FILTERS = [
  { value: "", label: "Alla" },
  { value: "felix", label: "Felix" },
  { value: "christopher", label: "Christopher" },
  { value: "none", label: "Okänd" },
] as const;

export default async function CoachingLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; owner?: string; q?: string }>;
}) {
  await requireCoach();
  const admin = createAdminClient();
  const { status: statusFilter, owner: ownerFilter, q } = await searchParams;
  const currentOwner = await getCurrentLeadOwner();

  const { data: allLeads, error: leadsError } = await admin
    .from("coaching_leads")
    .select(
      "id, name, phone, email, situation, utm_source, utm_medium, utm_campaign, status, owner, notes, created_at, status_updated_at",
    )
    .order("created_at", { ascending: false });

  if (leadsError) {
    // T.ex. en migration som inte körts (kolumn saknas) — utan denna logg
    // och felbanner ser detta bara ut som "inga leads" istället för det
    // tekniska felet det faktiskt är. Samma tysta-fel-mönster som orsakade
    // kundprogram-incidenten.
    console.error("CoachingLeadsPage — kunde inte hämta leads:", leadsError);
  }

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

  const ownerCounts = Object.fromEntries(
    OWNER_FILTERS.map((f) => [
      f.value,
      f.value === ""
        ? searched.length
        : f.value === "none"
          ? searched.filter((l) => !l.owner).length
          : searched.filter((l) => l.owner === f.value).length,
    ]),
  );

  const leads = searched.filter((l) => {
    const statusOk =
      !statusFilter || (statusFilter === "none" ? !l.status : l.status === statusFilter);
    const ownerOk =
      !ownerFilter || (ownerFilter === "none" ? !l.owner : l.owner === ownerFilter);
    return statusOk && ownerOk;
  });

  function buildHref(overrides: { status?: string; owner?: string }) {
    const params = new URLSearchParams();
    const status = overrides.status !== undefined ? overrides.status : (statusFilter ?? "");
    const owner = overrides.owner !== undefined ? overrides.owner : (ownerFilter ?? "");
    if (status) params.set("status", status);
    if (owner) params.set("owner", owner);
    if (q?.trim()) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/coaching/leads?${qs}` : "/coaching/leads";
  }

  return (
    <>
      <AutoRefresh />
      <div className={`wrap ${styles.wrap}`}>
        <span className="eyebrow">Admin</span>
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 20,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 100,
            padding: "8px 8px 8px 16px",
            width: "fit-content",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
            Annonsen körs just nu av:
          </span>
          {(["felix", "christopher"] as const).map((o) => (
            <form key={o} action={setActiveLeadOwner.bind(null, o)}>
              <button
                type="submit"
                className={styles.leadFilterPill}
                data-active={currentOwner === o || undefined}
                style={{ border: "1px solid var(--line)", cursor: "pointer" }}
              >
                {LEAD_OWNER_LABELS[o]}
              </button>
            </form>
          ))}
        </div>

        <form
          action="/coaching/leads"
          method="get"
          style={{ display: "flex", gap: 8, marginBottom: 16, maxWidth: 340 }}
        >
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          {ownerFilter && <input type="hidden" name="owner" value={ownerFilter} />}
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
          {OWNER_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={buildHref({ owner: f.value })}
              data-active={(ownerFilter ?? "") === f.value || undefined}
              className={styles.leadFilterPill}
            >
              {f.label} <span>{ownerCounts[f.value]}</span>
            </Link>
          ))}
        </div>

        <div className={styles.leadFilterBar}>
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={buildHref({ status: f.value })}
              data-status={f.value || undefined}
              data-active={(statusFilter ?? "") === f.value || undefined}
              className={styles.leadFilterPill}
            >
              {f.label} <span>{counts[f.value]}</span>
            </Link>
          ))}
        </div>

        {leadsError ? (
          <p
            style={{
              background: "var(--warm-soft)",
              color: "#5a4530",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.9rem",
              marginBottom: 20,
            }}
          >
            Kunde inte hämta leads just nu (tekniskt fel) — det här visar
            <b> inte</b> att leads saknas, bara att listan inte gick att
            läsa. Ladda om sidan, eller hör av dig om det upprepas.
          </p>
        ) : (
          leads.length === 0 && (
            <p className={styles.empty}>
              {query || statusFilter || ownerFilter
                ? "Inga leads matchade."
                : "Inga intresseanmälningar än."}
            </p>
          )
        )}

        <div className={styles.list}>
          {(leads ?? []).map((l) => {
            const reminder =
              l.status === "no_answer"
                ? getFollowUpReminder(l.status_updated_at as string)
                : null;
            return (
              <details key={l.id} className={styles.leadRow}>
                <summary className={styles.leadSummary}>
                  <span className={styles.leadSummaryName}>{l.name}</span>
                  <span className={styles.leadSummaryMeta}>{l.phone}</span>
                  {l.email && (
                    <span className={styles.leadSummaryMeta}>{l.email}</span>
                  )}
                  <span
                    className={styles.leadStatusBadge}
                    data-status={l.status || undefined}
                  >
                    {l.status ? STATUS_LABELS[l.status] : "Ingen status"}
                  </span>
                  <span className={styles.leadOwnerBadge}>
                    {l.owner
                      ? LEAD_OWNER_LABELS[l.owner as "felix" | "christopher"]
                      : "Okänd"}
                  </span>
                  {reminder && (
                    <span className={styles.leadFollowUpReminder}>⏰</span>
                  )}
                </summary>
                <div className={styles.leadDetails}>
                  <div className={styles.rowInfo}>
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
                    initialOwner={l.owner}
                  />
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </>
  );
}
