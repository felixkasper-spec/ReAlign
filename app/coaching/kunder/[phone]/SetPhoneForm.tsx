"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCustomerPhone } from "../actions";
import styles from "../kunder.module.css";

// Fyller i telefonnummer på en kund som bara har ett konto (ingen bokning/
// journal än, se migration 0077) — efter det blir resten av kundsidan
// tillgänglig (journal, bokningar, kom igång-formulär, kundprogram).
export default function SetPhoneForm({ userId }: { userId: string }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await setCustomerPhone(userId, phone);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      if (result.phone) router.push(`/coaching/kunder/${result.phone}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.addCustomerRow}>
      <input
        type="tel"
        placeholder="Telefonnummer"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Sparar..." : "Spara telefonnummer"}
      </button>
      {error && (
        <p style={{ color: "var(--warm)", fontSize: "0.85rem", width: "100%", margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
