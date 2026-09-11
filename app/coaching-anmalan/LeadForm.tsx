"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitCoachingLead } from "./actions";
import styles from "./page.module.css";

type LeadFormProps = {
  fbclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export default function LeadForm({
  fbclid,
  utmSource,
  utmMedium,
  utmCampaign,
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [situation, setSituation] = useState("");
  // Honeypot — osynligt fält som bara bottar fyller i. Riktiga besökare
  // varken ser eller når det.
  const [website, setWebsite] = useState("");
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
      formData.set("website", website);
      formData.set("fbclid", fbclid ?? "");
      formData.set("utm_source", utmSource ?? "");
      formData.set("utm_medium", utmMedium ?? "");
      formData.set("utm_campaign", utmCampaign ?? "");
      const result = await submitCoachingLead(formData);
      if (result.ok) {
        setStatus("success");
        setName("");
        setPhone("");
        setEmail("");
        setSituation("");
        setWebsite("");
      } else {
        setStatus("error");
      }
    });
  }

  if (status === "success") {
    return (
      <div id="lead-form" className={styles.formCard}>
        <h2>Tack!</h2>
        <p>
          Jag har fått din anmälan och ringer upp dig personligen, oftast samma
          dag.
        </p>
      </div>
    );
  }

  return (
    <form id="lead-form" className={styles.formCard} onSubmit={handleSubmit}>
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
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Lämna det här fältet tomt</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={isPending}
      >
        {isPending ? "Skickar..." : "Skicka intresseanmälan →"}
      </button>
      <p className={styles.formNote}>
        Jag ringer upp dig personligen, oftast samma dag.
      </p>
      <p className={styles.formConsent}>
        Genom att skicka in godkänner du att dina uppgifter sparas så att jag
        kan kontakta dig. Läs vår{" "}
        <Link href="/integritetspolicy">integritetspolicy</Link>.
      </p>
    </form>
  );
}
