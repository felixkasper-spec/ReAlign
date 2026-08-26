"use client";

import { useState, useTransition } from "react";
import { sendContactMessage } from "./actions";
import styles from "./page.module.css";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("email", email);
      formData.set("message", message);
      const result = await sendContactMessage(formData);
      if (result.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    });
  }

  if (status === "success") {
    return (
      <div className={styles.formSection}>
        <h2>Tack för ditt meddelande!</h2>
        <p>Vi återkommer så snart vi kan, till mejladressen du angav.</p>
      </div>
    );
  }

  return (
    <form className={styles.formSection} onSubmit={handleSubmit}>
      <h2>Eller skriv till oss direkt</h2>
      {status === "error" && (
        <p style={{ color: "var(--warm)", fontSize: "0.88rem", marginBottom: 12 }}>
          Något gick fel — testa igen, eller mejla oss direkt istället.
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
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <textarea
        placeholder="Vad kan vi hjälpa dig med?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? "Skickar..." : "Skicka meddelande"}
      </button>
    </form>
  );
}
