"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Meddelande från ${name || "sajten"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:hej@cleerklinik.se?subject=${subject}&body=${body}`;
  }

  return (
    <form className={styles.formSection} onSubmit={handleSubmit}>
      <h2>Eller skriv till oss direkt</h2>
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
      <button type="submit" className="btn btn-primary">
        Skicka meddelande
      </button>
    </form>
  );
}
