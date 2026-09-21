"use client";

import { useState, useTransition } from "react";
import { updateJournalEntry, deleteJournalEntry } from "../actions";
import styles from "../kunder.module.css";

export type JournalEntry = {
  id: string;
  body: string;
  attachment_type: string | null;
  attachmentUrl: string | null;
  created_at: string;
};

export default function JournalEntryItem({
  entry,
  customerPhone,
  onUseInProgram,
}: {
  entry: JournalEntry;
  customerPhone: string;
  // Skickar markerad text (eller, om inget är markerat, hela anteckningen)
  // vidare till programbyggaren på samma sida — se ProgramFromJournal.tsx.
  onUseInProgram?: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(entry.body);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateJournalEntry(entry.id, customerPhone, body);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      setEditing(false);
    });
  }

  function handleUseInProgram(e: React.MouseEvent) {
    e.stopPropagation();
    const selected = window.getSelection()?.toString().trim();
    onUseInProgram?.(selected && selected.length > 0 ? selected : entry.body);
  }

  return (
    <div
      className={styles.journalEntry}
      onClick={() => !editing && setEditing(true)}
      style={{ cursor: editing ? "default" : "pointer" }}
    >
      <div className={styles.journalMeta}>
        <span>
          {new Date(entry.created_at).toLocaleString("sv-SE", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
        <span style={{ display: "flex", gap: 10 }} onClick={(e) => e.stopPropagation()}>
          {!editing && onUseInProgram && entry.body && (
            <button type="button" onClick={handleUseInProgram} className={styles.deleteBtn}>
              → Gör till program
            </button>
          )}
          {!editing && (
            <button type="button" onClick={() => setEditing(true)} className={styles.deleteBtn}>
              Redigera
            </button>
          )}
          <form action={deleteJournalEntry.bind(null, entry.id, customerPhone)}>
            <button type="submit" className={styles.deleteBtn}>
              Ta bort
            </button>
          </form>
        </span>
      </div>

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {error && <p style={{ color: "var(--warm)", fontSize: "0.8rem" }}>{error}</p>}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className={styles.composerField}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
              disabled={pending}
              style={{ padding: "5px 14px" }}
            >
              {pending ? "Sparar..." : "Spara"}
            </button>
            <button
              type="button"
              onClick={() => {
                setBody(entry.body);
                setEditing(false);
                setError(null);
              }}
              className={styles.deleteBtn}
            >
              Avbryt
            </button>
          </div>
        </div>
      ) : (
        entry.body && <div className={styles.journalBody}>{entry.body}</div>
      )}

      {entry.attachmentUrl && (
        <div className={styles.journalAttachment}>
          {entry.attachment_type === "video" ? (
            <video src={entry.attachmentUrl} controls />
          ) : (
            <img src={entry.attachmentUrl} alt="Bilaga" />
          )}
        </div>
      )}
    </div>
  );
}
