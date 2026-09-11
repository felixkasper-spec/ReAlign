"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addJournalEntry, createJournalAttachmentUploadUrl } from "./actions";
import {
  COACHING_JOURNAL_BUCKET,
  MAX_JOURNAL_ATTACHMENT_BYTES,
} from "@/lib/coaching-journal";
import styles from "../../page.module.css";

export default function JournalComposer({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setError(null);
    if (!f) return;

    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      setError("Bara bilder och videor kan bifogas.");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_JOURNAL_ATTACHMENT_BYTES) {
      setError("Filen är för stor (max 25 MB).");
      e.target.value = "";
      return;
    }
    setFile(f);
  }

  function removeFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = textRef.current?.value.trim() ?? "";
    if (!body && !file) return;

    setPending(true);
    setError(null);

    try {
      let attachmentPath: string | null = null;
      let attachmentType: string | null = null;

      if (file) {
        const { path, token, type } = await createJournalAttachmentUploadUrl(
          userId,
          file.name,
          file.size,
          file.type,
        );
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from(COACHING_JOURNAL_BUCKET)
          .uploadToSignedUrl(path, token, file);
        if (uploadError) throw uploadError;
        attachmentPath = path;
        attachmentType = type;
      }

      const formData = new FormData();
      formData.set("body", body);
      if (attachmentPath) formData.set("attachment_path", attachmentPath);
      if (attachmentType) formData.set("attachment_type", attachmentType);

      await addJournalEntry(userId, formData);

      if (textRef.current) textRef.current.value = "";
      removeFile();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Något gick fel, försök igen.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.journalComposerCard}>
      {error && <p className={styles.journalError}>{error}</p>}
      {file && (
        <div className={styles.journalAttachChip}>
          <span>
            {file.type.startsWith("video/") ? "Video" : "Bild"}: {file.name}
          </span>
          <button
            type="button"
            onClick={removeFile}
            aria-label="Ta bort bilaga"
          >
            ✕
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.replyForm}>
        <textarea
          ref={textRef}
          placeholder="Skriv en privat anteckning..."
          rows={3}
          className={styles.textInput}
        />
        <div className={styles.journalAttachRow}>
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className={styles.journalFileInput}
            id="journal-attachment"
          />
          <label
            htmlFor="journal-attachment"
            className={styles.journalAttachBtn}
          >
            + Bild/video
          </label>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Sparar..." : "Spara anteckning"}
          </button>
        </div>
      </form>
    </div>
  );
}
