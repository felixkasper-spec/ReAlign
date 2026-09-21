import type { Metadata } from "next";
import Link from "next/link";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone, toInternationalPhone } from "@/lib/customer-identity";
import { COACHING_JOURNAL_BUCKET } from "@/lib/coaching-journal";
import { getBaseUrl } from "@/lib/base-url";
import ProgramFromJournal from "./ProgramFromJournal";
import TokenLinkInput from "./TokenLinkInput";
import LoginLink from "./LoginLink";
import listStyles from "../../page.module.css";
import styles from "../kunder.module.css";

export const metadata: Metadata = { title: "Kund — ReAlign Metoden" };

const STAFF_LABELS: Record<string, string> = { felix: "Felix", christopher: "Christopher" };

const INTAKE_FIELDS: { key: keyof IntakeRow; label: string }[] = [
  { key: "symptoms", label: "Vill ha hjälp med" },
  { key: "previous_injuries", label: "Tidigare skador" },
  { key: "medications", label: "Mediciner/kosttillskott" },
  { key: "sedentary_work", label: "Arbetsergonomi" },
  { key: "sleep_habits", label: "Sömn" },
  { key: "current_training", label: "Nuvarande träning" },
  { key: "equipment_access", label: "Utrustning" },
  { key: "goals", label: "Mål" },
  { key: "other_info", label: "Övrigt" },
];

type IntakeRow = {
  height_cm: number | null;
  weight_kg: number | null;
  symptoms: string | null;
  pain_level: number | null;
  previous_injuries: string | null;
  medications: string | null;
  sedentary_work: string | null;
  sleep_habits: string | null;
  current_training: string | null;
  equipment_access: string | null;
  session_length: string | null;
  goals: string | null;
  other_info: string | null;
  submitted_at: string | null;
  token: string;
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  await requireCoach();
  const { phone } = await params;
  const admin = createAdminClient();

  const { data: allBookings } = await admin
    .from("bookings")
    .select("id, service_id, staff, start_at, end_at, customer_name, customer_phone, customer_email, status")
    .order("start_at", { ascending: false });

  const bookings = (allBookings ?? []).filter((b) => normalizePhone(b.customer_phone) === phone);

  if (bookings.length === 0) {
    return (
      <div className={`wrap ${listStyles.wrap}`}>
        <Link href="/coaching/kunder" className={listStyles.back}>
          ← Kundlista
        </Link>
        <p className={listStyles.empty}>Ingen kund med det telefonnumret hittades.</p>
      </div>
    );
  }

  const canonical = bookings[0];
  const { data: services } = await admin.from("booking_services").select("id, name");
  const serviceNameById = new Map((services ?? []).map((s) => [s.id, s.name]));

  const { data: journalEntries } = await admin
    .from("coaching_journal_entries")
    .select("id, body, attachment_path, attachment_type, created_at")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });

  const journalWithUrls = await Promise.all(
    (journalEntries ?? []).map(async (entry) => {
      if (!entry.attachment_path) return { ...entry, attachmentUrl: null };
      const { data } = await admin.storage
        .from(COACHING_JOURNAL_BUCKET)
        .createSignedUrl(entry.attachment_path, 3600);
      return { ...entry, attachmentUrl: data?.signedUrl ?? null };
    }),
  );

  let { data: intake } = await admin
    .from("customer_intake_forms")
    .select(
      "height_cm, weight_kg, symptoms, pain_level, previous_injuries, medications, sedentary_work, sleep_habits, current_training, equipment_access, session_length, goals, other_info, submitted_at, token",
    )
    .eq("customer_phone", phone)
    .maybeSingle<IntakeRow>();

  if (!intake) {
    const { data: created } = await admin
      .from("customer_intake_forms")
      .insert({ customer_phone: phone, customer_name: canonical.customer_name })
      .select(
        "height_cm, weight_kg, symptoms, pain_level, previous_injuries, medications, sedentary_work, sleep_habits, current_training, equipment_access, session_length, goals, other_info, submitted_at, token",
      )
      .single<IntakeRow>();
    intake = created ?? null;
  }

  const baseUrl = await getBaseUrl();
  const formUrl = intake ? `${baseUrl}/f/${intake.token}` : null;
  const formSmsHref = formUrl
    ? `sms:${toInternationalPhone(phone)}&body=${encodeURIComponent(
        `Hej! Här är länken till kom igång-formuläret: ${formUrl}`,
      )}`
    : null;

  const { data: programs } = await admin
    .from("clinic_programs")
    .select("id, label, created_at, visit_count")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false });

  const { data: exercises } = await admin
    .from("exercises")
    .select("id, slug, title, body_part")
    .order("body_part")
    .order("title");

  const { data: customerLink } = await admin
    .from("customers")
    .select("linked_user_id")
    .eq("phone", phone)
    .maybeSingle();

  let linkedProfile: { userId: string; email: string; displayName: string | null } | null = null;
  if (customerLink?.linked_user_id) {
    const { data: linkedProfileRow } = await admin
      .from("profiles")
      .select("email, display_name")
      .eq("id", customerLink.linked_user_id)
      .maybeSingle();
    if (linkedProfileRow) {
      linkedProfile = {
        userId: customerLink.linked_user_id,
        email: linkedProfileRow.email,
        displayName: linkedProfileRow.display_name,
      };
    }
  }

  return (
    <div className={`wrap ${listStyles.wrap}`}>
      <Link href="/coaching/kunder" className={listStyles.back}>
          ← Kundlista
        </Link>
        <span className="eyebrow">Kund</span>
        <h1>{canonical.customer_name}</h1>
        <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", marginBottom: 12 }}>
          {phone}
          {canonical.customer_email ? ` · ${canonical.customer_email}` : ""}
        </p>

        <LoginLink phone={phone} customerName={canonical.customer_name} linkedProfile={linkedProfile} />
        {linkedProfile && (
          <p style={{ fontSize: "0.85rem", marginTop: -12, marginBottom: 20 }}>
            <Link href={`/coaching/${linkedProfile.userId}`}>Öppna chatt med kunden →</Link>
          </p>
        )}

        <div className={styles.dropdownRow}>
          <details className={styles.dropdownCard}>
            <summary className={styles.dropdownSummary}>
              Kom igång-formulär
              <span className={styles.dropdownHint}>
                {intake?.submitted_at ? "✓ Inskickat" : "Ej inskickat"}
              </span>
            </summary>
            <div className={styles.dropdownBody}>
              {formUrl && (
                <div className={`${styles.card}`}>
                  <div className={styles.tokenLink}>
                    <span>Länk att skicka till kunden:</span>
                    <TokenLinkInput value={formUrl} />
                    {formSmsHref && (
                      <a href={formSmsHref} className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>
                        Skicka via sms
                      </a>
                    )}
                  </div>
                </div>
              )}
              {intake?.submitted_at ? (
                <div className={styles.card}>
                  {INTAKE_FIELDS.map(
                    ({ key, label }) =>
                      intake![key] && (
                        <div key={key} style={{ fontSize: "0.88rem", marginBottom: 6 }}>
                          <b>{label}:</b> {String(intake![key])}
                          {key === "symptoms" && intake?.pain_level != null
                            ? ` (smärtnivå ${intake.pain_level}/10)`
                            : ""}
                        </div>
                      ),
                  )}
                  {(intake.height_cm || intake.weight_kg) && (
                    <div style={{ fontSize: "0.88rem", marginBottom: 6 }}>
                      <b>Längd/vikt:</b> {intake.height_cm ?? "—"} cm
                      {intake.weight_kg ? `, ${intake.weight_kg} kg` : ""}
                    </div>
                  )}
                  {intake.session_length && (
                    <div style={{ fontSize: "0.88rem", marginBottom: 6 }}>
                      <b>Programtid:</b> {intake.session_length} per pass
                    </div>
                  )}
                  <div style={{ fontSize: "0.75rem", color: "var(--text-soft)", marginTop: 8 }}>
                    Inskickat{" "}
                    {new Date(intake.submitted_at).toLocaleString("sv-SE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              ) : (
                <p className={listStyles.empty}>Formuläret är inte inskickat än.</p>
              )}
            </div>
          </details>

          <details className={styles.dropdownCard}>
            <summary className={styles.dropdownSummary}>
              Tidigare sessioner
              <span className={styles.dropdownHint}>{bookings.length}</span>
            </summary>
            <div className={styles.dropdownBody}>
              {bookings.map((b) => (
                <div key={b.id} className={styles.card}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {new Date(b.start_at).toLocaleString("sv-SE", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "UTC",
                    })}{" "}
                    · {serviceNameById.get(b.service_id) ?? "Okänd tjänst"}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-soft)" }}>
                    Med {STAFF_LABELS[b.staff] ?? b.staff}
                    {b.status === "cancelled" ? " · Avbokad" : ""}
                  </div>
                </div>
              ))}
            </div>
          </details>

          <details className={styles.dropdownCard}>
            <summary className={styles.dropdownSummary}>
              Tidigare program
              <span className={styles.dropdownHint}>{programs?.length ?? 0}</span>
            </summary>
            <div className={styles.dropdownBody}>
              <a
                href="#program-builder"
                className="btn btn-primary"
                style={{ padding: "6px 14px", display: "inline-block", marginBottom: 10 }}
              >
                + Skapa nytt program
              </a>
              {(!programs || programs.length === 0) && (
                <p className={listStyles.empty}>Inga program skapade än.</p>
              )}
              {(programs ?? []).map((p) => (
                <Link key={p.id} href={`/coaching/kundprogram/${p.id}`} className={styles.card} style={{ display: "block" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.label}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-soft)" }}>
                    Skapat{" "}
                    {new Date(p.created_at).toLocaleString("sv-SE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {p.visit_count > 0 ? ` · Öppnad ${p.visit_count} ${p.visit_count === 1 ? "gång" : "gånger"}` : " · Inte öppnat än"}
                  </div>
                </Link>
              ))}
            </div>
          </details>
        </div>

        <ProgramFromJournal
          customerPhone={phone}
          customerName={canonical.customer_name}
          customerEmail={canonical.customer_email}
          journalEntries={journalWithUrls}
          exercises={exercises ?? []}
          baseUrl={baseUrl}
        />
    </div>
  );
}
