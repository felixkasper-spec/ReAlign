"use client";

import { useState, useTransition } from "react";
import { createPackage } from "./actions";
import styles from "./upplagg.module.css";

export default function AddPackageForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPackage(name);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      setName("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.addRow}>
      <input
        placeholder="Kundens namn"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Lägger till..." : "+ Nytt upplägg"}
      </button>
      {error && <p style={{ color: "var(--warm)", fontSize: "0.85rem" }}>{error}</p>}
    </form>
  );
}
