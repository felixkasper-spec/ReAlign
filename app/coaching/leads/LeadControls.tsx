"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus, updateLeadNotes, deleteLead, logCallAttempt } from "./actions";
import styles from "../page.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "Ingen status" },
  { value: "no_answer", label: "Inget svar / ring igen" },
  { value: "not_interested", label: "Ej intresserad" },
  { value: "purchased", label: "Köpt" },
  { value: "follow_up", label: "Följ upp" },
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
const SMS_TEMPLATES = [
  {
    label: "SMS 1 · missat samtal",
    text: (firstName: string) =>
      `Hej ${firstName}! Felix här på ReAlign Metoden — försökte ringa dig angående din intresseanmälan för Premium Coaching. Hör gärna av dig när det passar, annars ringer jag igen! 🙂`,
  },
  {
    label: "SMS 2 · andra försöket",
    text: (firstName: string) =>
      `Hej ${firstName}, provade ringa igen men missade dig. Funkar det bättre om du själv skriver en tid som passar, så ringer jag då istället? 🙂 / Felix, ReAlign Metoden`,
  },
  {
    label: "SMS 3 · sista försöket",
    text: (firstName: string) =>
      `Hej igen ${firstName}! Hör av dig när det passar, annars antar jag att timing inte är rätt just nu — helt okej, du är alltid välkommen att höra av dig senare. / Felix`,
  },
] as const;

function buildSmsHref(template: (typeof SMS_TEMPLATES)[number], name: string, phone: string) {
  const firstName = name.trim().split(/\s+/)[0] || name;
  return `sms:${phone}?body=${encodeURIComponent(template.text(firstName))}`;
}

export default function LeadControls({
  leadId,
  name,
  phone,
  initialStatus,
  initialNotes,
}: {
  leadId: string;
  name: string;
  phone: string;
  initialStatus: string | null;
  initialNotes: string | null;
}) {
  const [status, setStatus] = useState(initialStatus ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [savedNotes, setSavedNotes] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [smsPick, setSmsPick] = useState("");

  function handleSmsPick(e: React.ChangeEvent<HTMLSelectElement>) {
    const index = Number(e.target.value);
    const template = SMS_TEMPLATES[index];
    if (template) {
      window.location.href = buildSmsHref(template, name, phone);
    }
    setSmsPick("");
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setStatus(value);
    startTransition(async () => {
      await updateLeadStatus(leadId, value || null);
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
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Kommentar..."
        rows={2}
        className={styles.leadNotesInput}
        disabled={deleting}
      />
      <div className={styles.leadControlsRow}>
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
