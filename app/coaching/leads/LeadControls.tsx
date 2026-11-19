"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  updateLeadStatus,
  updateLeadNotes,
  updateLeadOwner,
  deleteLead,
  logCallAttempt,
} from "./actions";
import { LEAD_OWNER_LABELS, type LeadOwner } from "@/lib/lead-owner";
import styles from "../page.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "Ingen status" },
  { value: "no_answer", label: "Inget svar / ring igen" },
  { value: "not_interested", label: "Ej intresserad" },
  { value: "purchased", label: "Köpt" },
  { value: "follow_up", label: "Följ upp" },
];

const OWNER_OPTIONS: { value: "" | LeadOwner; label: string }[] = [
  { value: "", label: "Okänd" },
  { value: "felix", label: "Felix" },
  { value: "christopher", label: "Christopher" },
];

// sms:-länkar öppnar telefonens egna SMS-app med numret och texten redan
// ifyllda — coachen trycker bara skicka (eller redigerar först). "?" funkar
// på både iOS och Android numera (äldre iOS ville ha "&", inte längre
// relevant).
//
// Tre steg i uppföljningskadensen för ett lead som inte svarar i telefon:
// SMS 1 samma dag direkt efter missat samtal, SMS 2 nästa dag efter ett
// andra missat samtal, SMS 3 som sista försök 2–3 dagar senare. Se
// coaching/leads/page.tsx för påminnelsen om NÄR nästa steg är aktuellt.
// Signaturen anpassas efter vem leadet tillhör (Felix eller Christopher)
// eftersom två olika coacher kan skicka — faller tillbaka till "ReAlign
// Metoden" om ägaren är okänd.
const SMS_TEMPLATES = [
  {
    label: "Boka direkt · förstakontakt",
    text: (firstName: string, sender: string) =>
      `Hej ${firstName} 😊\n\nKul att du anmält dig om Premium Coaching!\n\nFörsta träffen innebär hållnings- och funktionsanalys, genomgång av dina mål samt en första uppsättning posturala övningar skräddarsydda för dig.\nTid 70 minuter.\n\nJag håller till på Hulda Lindgrens gata 8 i Högsbo.\n\nJag har en tid [ANGE TID OCH DAG] ledig. Funkar den? Annars tittar jag på andra tider.\nJag behöver svar ganska snabbt för att tiden säkert ska finnas kvar.\n\nVänlig hälsning\n${sender}, ReAlign Metoden 🤗`,
  },
  {
    label: "SMS 1 · missat samtal",
    text: (firstName: string, sender: string) =>
      `Hej ${firstName}! ${sender} här på ReAlign Metoden — försökte ringa dig angående din intresseanmälan för Premium Coaching. Hör gärna av dig när det passar, annars ringer jag igen! 🙂`,
  },
  {
    label: "SMS 2 · andra försöket",
    text: (firstName: string, sender: string) =>
      `Hej ${firstName}, provade ringa igen men missade dig. Funkar det bättre om du själv skriver en tid som passar, så ringer jag då istället? 🙂 / ${sender}, ReAlign Metoden`,
  },
  {
    label: "SMS 3 · sista försöket",
    text: (firstName: string, sender: string) =>
      `Hej igen ${firstName}! Hör av dig när det passar, annars antar jag att timing inte är rätt just nu — helt okej, du är alltid välkommen att höra av dig senare. / ${sender}`,
  },
] as const;

function buildSmsHref(
  template: (typeof SMS_TEMPLATES)[number],
  name: string,
  phone: string,
  owner: string | null,
) {
  const firstName = name.trim().split(/\s+/)[0] || name;
  const sender = owner ? LEAD_OWNER_LABELS[owner as LeadOwner] : "ReAlign Metoden";
  return `sms:${phone}?body=${encodeURIComponent(template.text(firstName, sender))}`;
}

export default function LeadControls({
  leadId,
  name,
  phone,
  email,
  initialStatus,
  initialNotes,
  initialOwner,
}: {
  leadId: string;
  name: string;
  phone: string;
  email: string | null;
  initialStatus: string | null;
  initialNotes: string | null;
  initialOwner: string | null;
}) {
  const [status, setStatus] = useState(initialStatus ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [savedNotes, setSavedNotes] = useState(initialNotes ?? "");
  const [owner, setOwner] = useState(initialOwner ?? "");
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [smsPick, setSmsPick] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);

  function handleOwnerChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setOwner(value);
    startTransition(async () => {
      await updateLeadOwner(leadId, value || null);
    });
  }

  function handleSmsPick(e: React.ChangeEvent<HTMLSelectElement>) {
    const index = Number(e.target.value);
    const template = SMS_TEMPLATES[index];
    if (template) {
      window.location.href = buildSmsHref(template, name, phone, owner || null);
    }
    setSmsPick("");
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const previous = status;
    const value = e.target.value;
    setStatus(value);
    setStatusError(null);
    startTransition(async () => {
      // Optimistisk UI ovan kunde tidigare lämna en status som "sparad" i
      // gränssnittet trots att skrivningen misslyckades (t.ex. nätverksfel)
      // — en sidladdning visade då den gamla statusen igen utan förklaring.
      // Backar nu tillbaka valet och visar ett fel istället.
      let ok = false;
      let error: string | undefined;
      try {
        const result = await updateLeadStatus(leadId, value || null);
        ok = result.ok;
        error = result.error;
      } catch (err) {
        // Visa den faktiska undantagstexten (t.ex. "Failed to fetch" vid
        // ett avbrutet anrop) istället för att bara svälja den — annars ser
        // varje möjlig orsak likadan ut och går inte att skilja åt.
        ok = false;
        error = `Tekniskt fel: ${err instanceof Error ? err.message : String(err)}`;
      }
      if (!ok) {
        setStatus(previous);
        setStatusError(error ?? "Kunde inte spara statusen, försök igen.");
      }
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      await updateLeadNotes(leadId, notes);
      setSavedNotes(notes);
    });
  }

  async function handleDelete() {
    if (!confirm(`Ta bort den här leaden permanent? Går inte att ångra.`)) {
      return;
    }
    setDeleting(true);
    await deleteLead(leadId);
  }

  return (
    <div className={styles.leadControls}>
      <select
        value={status}
        data-status={status || undefined}
        onChange={handleStatusChange}
        className={styles.leadStatusSelect}
        disabled={deleting}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {statusError && (
        <span style={{ color: "var(--warm)", fontSize: "0.8rem" }}>{statusError}</span>
      )}
      <select
        value={owner}
        onChange={handleOwnerChange}
        className={styles.leadStatusSelect}
        disabled={deleting}
      >
        {OWNER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Ägare: {opt.label}
          </option>
        ))}
      </select>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Kommentar..."
        rows={2}
        className={styles.leadNotesInput}
        disabled={deleting}
      />
      <div className={styles.leadControlsRow}>
        <Link
          href={`/coaching/kalender?staff=${owner || "felix"}&leadName=${encodeURIComponent(name)}&leadPhone=${encodeURIComponent(phone)}&leadEmail=${encodeURIComponent(email ?? "")}`}
          className={styles.markReadBtn}
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          📅 Boka
        </Link>
        <a
          href={`tel:${phone}`}
          className={styles.markReadBtn}
          style={{ textDecoration: "none", display: "inline-block" }}
          onClick={() => {
            // Om leadet redan är markerat "no_answer" räknas det här klicket
            // som ett nytt samtalsförsök — nollställer uppföljningsklockan
            // så nästa påminnelse räknas från just det här samtalet, inte
            // från det första missade samtalet för länge sen.
            if (status === "no_answer") {
              startTransition(async () => {
                await logCallAttempt(leadId);
              });
            }
          }}
        >
          📞 Ring
        </a>
        <select
          value={smsPick}
          onChange={handleSmsPick}
          className={styles.markReadBtn}
          disabled={deleting}
        >
          <option value="">📱 Skicka SMS...</option>
          {SMS_TEMPLATES.map((template, i) => (
            <option key={template.label} value={i}>
              {template.label}
            </option>
          ))}
        </select>
        {notes !== savedNotes && (
          <button
            type="button"
            onClick={handleSaveNotes}
            className={styles.markReadBtn}
            disabled={pending || deleting}
          >
            Spara kommentar
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          className={styles.journalDeleteBtn}
          disabled={deleting}
        >
          {deleting ? "Tar bort..." : "Ta bort lead"}
        </button>
      </div>
    </div>
  );
}
