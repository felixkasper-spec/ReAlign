"use client";

import { useState, useTransition } from "react";
import { submitCoachingLead } from "./actions";
import styles from "./page.module.css";

export default function LeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [situation, setSituation] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("phone", phone);
      formData.set("email", email);
      formData.set("situation", situation);
      const result = await submitCoachingLead(formData);
      if (result.ok) {
        setStatus("success");
        setName("");
        setPhone("");
        setEmail("");
        setSituation("");
      } else {
        setStatus("error");
      }
    });
  }

  if (status === "success") {
    return (
      <div className={styles.formCard}>
        <h2>Tack!</h2>
        <p>
          Jag har fått din anmälan och ringer upp dig personligen inom kort.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.formCard} onSubmit={handleSubmit}>
      <h2>Nyfiken? Lämna dina uppgifter, så ringer jag dig.</h2>
      <p className={styles.formIntro}>
        Inte bindande — bara ett samtal, ingen förpliktelse.
      </p>
      {status === "error" && (
        <p className={styles.formError}>
          Något gick fel — testa igen om en stund.
        </p>
      )}
      <div className={styles.formRow}>
        <input
          type="text"
          placeholder="Namn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Telefonnummer"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <input
        type="email"
        placeholder="Mejl (valfritt)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <textarea
        placeholder="Vad vill du ha hjälp med?"
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        required
        rows={3}
      />
      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={isPending}
      >
        {isPending ? "Skickar..." : "Skicka intresseanmälan →"}
      </button>
      <p className={styles.formNote}>
        Jag ringer upp dig personligen inom kort.
      </p>
    </form>
  );
}
