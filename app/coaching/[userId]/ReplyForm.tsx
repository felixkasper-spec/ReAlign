"use client";

import { useRef, useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { generateReplyDraft } from "../actions";
import styles from "../page.module.css";

export default function ReplyForm({
  userId,
  reply,
  aiEnabled,
}: {
  userId: string;
  reply: (formData: FormData) => void | Promise<void>;
  aiEnabled: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  async function handleSuggest() {
    setPending(true);
    setError(null);
    const result = await generateReplyDraft(userId);
    if ("error" in result) {
      setError(result.error);
    } else if (textRef.current) {
      textRef.current.value = result.draft;
      textRef.current.focus();
    }
    setPending(false);
  }

  return (
    <form action={reply} className={styles.replyForm}>
      {aiEnabled && (
        <div className={styles.aiDraftRow}>
          <button
            type="button"
            className={styles.aiDraftBtn}
            onClick={handleSuggest}
            disabled={pending}
          >
            {pending ? "Tar fram förslag..." : "✨ Föreslå svar"}
          </button>
        </div>
      )}
      {error && <p className={styles.aiDraftError}>{error}</p>}
      <div className={styles.replyRow}>
        <textarea
          ref={textRef}
          name="body"
          placeholder="Skriv ditt svar..."
          required
          rows={1}
          className={styles.textInputCompact}
        />
        <SubmitButton className="btn btn-primary" pendingText="Skickar...">
          Svara →
        </SubmitButton>
      </div>
    </form>
  );
}
