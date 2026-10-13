import type { Metadata } from "next";
import Link from "next/link";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone, toInternationalPhone } from "@/lib/customer-identity";
import { COACHING_JOURNAL_BUCKET } from "@/lib/coaching-journal";
import { COACHING_ATTACHMENT_BUCKET } from "@/lib/coaching-attachments";
import { getBaseUrl } from "@/lib/base-url";
import ProgramFromJournal from "./ProgramFromJournal";
import TokenLinkInput from "./TokenLinkInput";
import LoginLink from "./LoginLink";
import SetPhoneForm from "./SetPhoneForm";
import SendIntakeEmailButton from "./SendIntakeEmailButton";
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

// coaching_intake (Premium Coaching, kontobaserad — se migration 0047/0079)
// har delvis andra fält än customer_intake_forms (telefonbaserad) ovan,
// t.ex. rörelsebegränsningar och fyra hållningsfoton istället för en
// delningslänk. Samma mönster som /coaching/intag använder redan.
const COACHING_INTAKE_FIELDS: { key: keyof CoachingIntakeRow; label: string }[] = [
  { key: "previous_injuries", label: "Tidigare skador" },
  { key: "movement_limitations", label: "Rörelsebegränsningar" },
  { key: "medications", label: "Mediciner/kosttillskott" },
  { key: "sedentary_work", label: "Arbetsergonomi" },
  { key: "sleep_habits", label: "Sömn" },
  { key: "current_training", label: "Nuvarande träning" },
  { key: "equipment_access", label: "Utrustning" },
  { key: "goals", label: "Mål" },
  { key: "other_info", label: "Övrigt" },
];

const COACHING_PHOTO_FIELDS = [
  { key: "photo_front_path", label: "Framifrån" },
  { key: "photo_back_path", label: "Bakifrån" },
  { key: "photo_left_path", label: "Vänster sida" },
  { key: "photo_right_path", label: "Höger sida" },
] as const;

type CoachingIntakeRow = {
  height_cm: number | null;
  weight_kg: number | null;
  symptoms: string;
  pain_level: number | null;
  previous_injuries: string | null;
  movement_limitations: string | null;
  medications: string | null;
  sedentary_work: string | null;
  sleep_habits: string | null;
  current_training: string | null;
  equipment_access: string | null;
  session_length: string | null;
  weekly_time_budget: string | null;
  goals: string | null;
  other_info: string | null;
  photo_front_path: string | null;
  photo_back_path: string | null;
  photo_left_path: string | null;
  photo_right_path: string | null;
  submitted_at: string;
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  await requireCoach();
  const { phone: rawParam } = await params;
  const admin = createAdminClient();

  // Ett konto utan telefon (ren prenumerant, se migration 0077) nås via sin
  // e-post istället — urlencoded i routen eftersom "@" annars krockar med
  // Next.js segment-parsning. Den kunden har per definition ingen bokning/
  // journal/formulär/kundprogram att visa (allt det är kopplat via telefon,
  // som saknas) — en egen, enklare vy nedan istället för att tvinga resten
  // av sidans telefon-beroende frågor genom en null/e-post-sträng.
  //
  // rawParam kan vara URL-encodad ("%40") eller redan avkodad ("@") beroende
  // på var anropet kommer ifrån — avkoda FÖRST och kolla sedan, annars missar
  // "@"-kollen den encodade formen och skickar kontot till fel-grenen nedan
  // (telefon-sökningen), som är exakt buggen som gjorde att en nyss skapad
  // konto-kund visade "Ingen kund med det telefonnumret hittades."
  let decodedParam = rawParam;
  try {
    decodedParam = decodeURIComponent(rawParam);
  } catch {
    // Ogiltig procent-sekvens — använd rawParam oavkodad, bättre än att
    // krascha hela sidan.
  }
  const isEmailKey = decodedParam.includes("@");
  if (isEmailKey) {
    const email = decodedParam;
    const { data: accountCustomer } = await admin
      .from("customers")
      .select("name, email, linked_user_id")
      .eq("email", email)
      .maybeSingle();

    if (!accountCustomer) {
      return (
        <div className={`wrap ${listStyles.wrap}`}>
          <Link href="/coaching/kunder" className={listStyles.back}>
            ← Kundlista
          </Link>
          <p className={listStyles.empty}>Ingen kund med den e-posten hittades.</p>
        </div>
      );
    }

    const userId = accountCustomer.linked_user_id;

    let linkedDisplayName: string | null = null;
    if (userId) {
      const { data: linkedProfileRow } = await admin
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle();
      linkedDisplayName = linkedProfileRow?.display_name ?? null;
    }

    // Journal, kom igång-formulär och kundprogram är alla byggda för att
    // stödja en ren konto-kund utan telefon sedan tidigare i databasen
    // (coaching_journal_entries.user_id sedan migration 0069,
    // clinic_programs.customer_email sedan migration 0068) — bara den här
    // sidan behövde kopplas ihop med dem. coaching_intake är samma tabell
    // som /min-sida/coaching/formular skriver till och /coaching/intag
    // redan listar, bara filtrerad till den här kunden.
    const [
      { data: journalEntries },
      { data: intake },
      { data: programs },
      { data: exercises },
    ] = await Promise.all([
      userId
        ? admin
            .from("coaching_journal_entries")
            .select("id, body, attachment_path, attachment_type, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as never[] }),
      userId
        ? admin
            .from("coaching_intake")
            .select(
              "height_cm, weight_kg, symptoms, pain_level, previous_injuries, movement_limitations, medications, sedentary_work, sleep_habits, current_training, equipment_access, session_length, weekly_time_budget, goals, other_info, photo_front_path, photo_back_path, photo_left_path, photo_right_path, submitted_at",
            )
            .eq("user_id", userId)
            .maybeSingle<CoachingIntakeRow>()
        : Promise.resolve({ data: null }),
      admin
        .from("clinic_programs")
        .select("id, label, created_at, visit_count")
        .eq("customer_email", email)
        .order("created_at", { ascending: false }),
      admin.from("exercises").select("id, slug, title, body_part").order("body_part").order("title"),
    ]);

    const journalWithUrls = await Promise.all(
      (journalEntries ?? []).map(async (entry) => {
        if (!entry.attachment_path) return { ...entry, attachmentUrl: null };
        const { data } = await admin.storage
          .from(COACHING_JOURNAL_BUCKET)
          .createSignedUrl(entry.attachment_path, 3600);
        return { ...entry, attachmentUrl: data?.signedUrl ?? null };
      }),
    );

    const intakePhotos = intake
      ? await Promise.all(
          COACHING_PHOTO_FIELDS.map(async ({ key, label }) => {
            const path = intake[key];
            if (!path) return null;
            const { data } = await admin.storage
              .from(COACHING_ATTACHMENT_BUCKET)
              .createSignedUrl(path, 3600);
            return data?.signedUrl ? { label, url: data.signedUrl } : null;
          }),
        )
      : [];
    const intakePhotoLinks = intakePhotos.filter(Boolean) as { label: string; url: string }[];

    const baseUrl = await getBaseUrl();
    const displayName = accountCustomer.name || linkedDisplayName || email;

    return (
      <div className={`wrap ${listStyles.wrap}`}>
        <Link href="/coaching/kunder" className={listStyles.back}>
          ← Kundlista
        </Link>
        <span className="eyebrow">Kund</span>
        <h1>{displayName}</h1>
        <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", marginBottom: 12 }}>
          {email} · Bara konto, inget telefonnummer sparat
        </p>
        {userId && (
          <p style={{ fontSize: "0.85rem", marginBottom: 20 }}>
            <Link href={`/coaching/${userId}`}>Öppna chatt med kunden →</Link>
          </p>
        )}

        <details className={styles.dropdownCard} style={{ marginBottom: 20 }}>
          <summary className={styles.dropdownSummary}>
            Lägg till telefonnummer <span className={styles.dropdownHint}>valfritt</span>
          </summary>
          <div className={styles.dropdownBody}>
            <p style={{ fontSize: "0.85rem", marginBottom: 10 }}>
              Inte nödvändigt — journal, kom igång-formulär och kundprogram
              fungerar redan utan telefonnummer. Lägg bara till ett om
              kunden ringer in eller bokar en tid, så syns bokningarna här
              också.
            </p>
            {userId && <SetPhoneForm userId={userId} />}
          </div>
        </details>

        <div className={styles.dropdownRow}>
          <details className={styles.dropdownCard}>
            <summary className={styles.dropdownSummary}>
              Kom igång-formulär
              <span className={styles.dropdownHint}>
                {intake?.submitted_at ? "✓ Inskickat" : "Ej inskickat"}
              </span>
            </summary>
            <div className={styles.dropdownBody}>
              {intake?.submitted_at ? (
                <div className={styles.card}>
                  {COACHING_INTAKE_FIELDS.map(
                    ({ key, label }) =>
                      intake[key] && (
                        <div key={key} style={{ fontSize: "0.88rem", marginBottom: 6 }}>
                          <b>{label}:</b> {String(intake[key])}
                          {key === "previous_injuries" && intake.pain_level != null
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
                  {(intake.session_length || intake.weekly_time_budget) && (
                    <div style={{ fontSize: "0.88rem", marginBottom: 6 }}>
                      <b>Programtid:</b> {intake.session_length ?? "—"} per pass,{" "}
                      {intake.weekly_time_budget ?? "—"} per vecka
                    </div>
                  )}
                  {intakePhotoLinks.length > 0 && (
                    <div style={{ fontSize: "0.88rem", marginBottom: 6 }}>
                      <b>Hållningsfoton:</b>{" "}
                      {intakePhotoLinks.map((photo) => (
                        <a
                          key={photo.label}
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginRight: 10 }}
                        >
                          {photo.label}
                        </a>
                      ))}
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
                <div className={`${styles.card}`}>
                  <p style={{ fontSize: "0.88rem", marginBottom: 10 }}>
                    Formuläret är inte inskickat än. Kunden fyller i det
                    själv på Min sida om de har Premium Coaching.
                  </p>
                  <SendIntakeEmailButton
                    email={email}
                    formUrl={`${baseUrl}/min-sida/coaching/formular`}
                  />
                </div>
              )}
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
          userId={userId ?? undefined}
          revalidateSlug={rawParam}
          customerName={displayName}
          customerEmail={email}
          journalEntries={journalWithUrls}
          exercises={exercises ?? []}
          baseUrl={baseUrl}
        />
      </div>
    );
  }

  const phone = rawParam;

  const { data: allBookings } = await admin
    .from("bookings")
    .select("id, service_id, staff, start_at, end_at, customer_name, customer_phone, customer_email, status")
    .order("start_at", { ascending: false });

  const bookings = (allBookings ?? []).filter((b) => normalizePhone(b.customer_phone) === phone);

  // Kunder tillagda direkt (kundsidan, eller "Skapa kund" i kalenderns
  // bokningsskapare) har ännu ingen bokning att hämta namn/mejl ifrån —
  // faller tillbaka på customers-raden istället för att visa "hittades ej".
  const { data: standaloneCustomer } = await admin
    .from("customers")
    .select("name, email, linked_user_id")
    .eq("phone", phone)
    .maybeSingle();

  if (bookings.length === 0 && !standaloneCustomer) {
    return (
      <div className={`wrap ${listStyles.wrap}`}>
        <Link href="/coaching/kunder" className={listStyles.back}>
          ← Kundlista
        </Link>
        <p className={listStyles.empty}>Ingen kund med det telefonnumret hittades.</p>
      </div>
    );
  }

  const canonical = bookings[0] ?? {
    customer_name: standaloneCustomer!.name || phone,
    customer_email: standaloneCustomer!.email,
  };
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

  let linkedProfile: { userId: string; email: string; displayName: string | null } | null = null;
  if (standaloneCustomer?.linked_user_id) {
    const { data: linkedProfileRow } = await admin
      .from("profiles")
      .select("email, display_name")
      .eq("id", standaloneCustomer.linked_user_id)
      .maybeSingle();
    if (linkedProfileRow) {
      linkedProfile = {
        userId: standaloneCustomer.linked_user_id,
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
                    {canonical.customer_email && (
                      <SendIntakeEmailButton email={canonical.customer_email} formUrl={formUrl} />
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
          revalidateSlug={phone}
          customerName={canonical.customer_name}
          customerEmail={canonical.customer_email}
          journalEntries={journalWithUrls}
          exercises={exercises ?? []}
          baseUrl={baseUrl}
        />
    </div>
  );
}
