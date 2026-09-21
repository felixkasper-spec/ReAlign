"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "./actions";
import styles from "./kunder.module.css";

export default function AddCustomerForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCustomer(name, phone, email);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      setName("");
      setPhone("");
      setEmail("");
      setOpen(false);
      if (result.phone) router.push(`/coaching/kunder/${result.phone}`);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
        style={{ marginBottom: 16 }}
      >
        + Lägg till kund
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.addCustomerRow}>
      <input
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
      <input
        type="email"
        placeholder="Mejl (valfritt)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Sparar..." : "Spara"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={styles.deleteBtn}
        disabled={pending}
      >
        Avbryt
      </button>
      {error && (
        <p style={{ color: "var(--warm)", fontSize: "0.85rem", width: "100%", margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
