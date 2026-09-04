"use client";

import { useState, useTransition } from "react";
import { sendSaveForLaterLink } from "./save-for-later-actions";
import styles from "./page.module.css";

export default function SaveForLaterForm({
  programSlug,
  programTitle,
}: {
  programSlug: string;
  programTitle: string;
}) {
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("programSlug", programSlug);
      formData.set("programTitle", programTitle);
      if (newsletter) formData.set("newsletter", "on");
      const result = await sendSaveForLaterLink(formData);
      setStatus(result.ok ? "success" : "error");
    });
  }

  if (status === "success") {
    return (
      <div className={styles.saveForLater}>
        <div>
          <b>Klart!</b>
          <p>Vi har skickat länken till {email}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.saveForLater}>
      <div>
        <b>Inte läge just nu?</b>
        <p>Få länken skickad till din mejl, så kan du testa när det passar.</p>
        {status === "error" && (
          <p style={{ color: "var(--warm)", marginTop: 6 }}>
            Något gick fel — testa igen om en stund.
          </p>
        )}
      </div>
      <form className={styles.saveForLaterForm} onSubmit={handleSubmit}>
        <div className={styles.saveForLaterInputRow}>
          <input
            type="email"
            placeholder="din@mejl.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            {isPending ? "Skickar..." : "Skicka länk"}
          </button>
        </div>
        <label className={styles.saveForLaterCheckbox}>
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
          />
          Jag vill också få träningstips och nyheter via mejl
        </label>
      </form>
    </div>
  );
}
