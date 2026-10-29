"use client";

import { useState, useTransition } from "react";
import { sendCoachingCheckin, dismissCoachingCheckin } from "./actions";
import { buildCheckinMessage } from "@/lib/cadence-messages";
import styles from "./page.module.css";

// Ett kort per Premium Coaching-kund som är "mogen" för en
// varannan-veckan-avstämning (se /coaching/page.tsx för due-beräkningen).
// Meddelandet är förifyllt men redigerbart — skickas som ett vanligt
// coach-meddelande i chatten (samma mejlnotis som ett manuellt svar).
export default function CheckinCard({
  userId,
  name,
  daysSince,
}: {
  userId: string;
  name: string;
  daysSince: number;
}) {
  const [message, setMessage] = useState(() => buildCheckinMessage(name));
  const [sent, setSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSend() {
    setError(null);
    startTransition(async () => {
      const result = await sendCoachingCheckin(userId, message);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      setSent(true);
    });
  }

  function handleDismiss() {
    setError(null);
    startTransition(async () => {
      const result = await dismissCoachingCheckin(userId);
      if (!result.ok) {
        setError("Något gick fel.");
        return;
      }
      setDismissed(true);
    });
  }

  if (sent || dismissed) {
    return (
      <div className={styles.contactRow}>
        <div className={styles.rowInfo}>
          <div className={styles.name}>{name}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--sage)" }}>
            {sent ? "✓ Avstämning skickad" : "Hoppades över — dyker upp igen om 14 dagar"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.contactRow} style={{ flexDirection: "column", alignItems: "stretch" }}>
      <div className={styles.rowInfo} style={{ marginBottom: 10 }}>
        <div className={styles.name}>{name}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-soft)" }}>
          {Math.floor(daysSince)} dagar sedan senaste avstämningen
        </div>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: "0.88rem",
          fontFamily: "inherit",
          marginBottom: 10,
          resize: "vertical",
        }}
      />
      {error && (
        <p style={{ color: "var(--warm)", fontSize: "0.82rem", marginBottom: 8 }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={handleSend}
          className="btn btn-primary"
          disabled={pending}
          style={{ padding: "6px 16px" }}
        >
          {pending ? "..." : "Skicka"}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className={styles.markReadBtn}
          disabled={pending}
        >
          Hoppa över
        </button>
      </div>
    </div>
  );
}
