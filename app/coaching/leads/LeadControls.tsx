"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus, updateLeadNotes, deleteLead } from "./actions";
import styles from "../page.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "Ingen status" },
  { value: "no_answer", label: "Inget svar / ring igen" },
  { value: "not_interested", label: "Ej intresserad" },
  { value: "purchased", label: "Köpt" },
  { value: "follow_up", label: "Följ upp" },
];

export default function LeadControls({
  leadId,
  initialStatus,
  initialNotes,
}: {
  leadId: string;
  initialStatus: string | null;
  initialNotes: string | null;
}) {
  const [status, setStatus] = useState(initialStatus ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [savedNotes, setSavedNotes] = useState(initialNotes ?? "");
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

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
