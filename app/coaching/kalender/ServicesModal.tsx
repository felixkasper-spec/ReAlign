"use client";

import { useState, useTransition } from "react";
import { createService, toggleServiceActive } from "./actions";
import styles from "./admin-shell.module.css";

export type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price_sek: number;
  active: boolean;
};

export default function ServicesModal({
  services,
  onClose,
}: {
  services: ServiceRow[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createService(name, Number(duration), Number(price));
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      setName("");
      setDuration("30");
      setPrice("0");
    });
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2>Tjänster</h2>
          <button type="button" onClick={onClose} aria-label="Stäng">
            ✕
          </button>
        </div>

        <div className={styles.modalList}>
          {services.map((s) => (
            <div key={s.id} className={styles.modalRow}>
              <span>
                {s.name} · {s.duration_minutes} min
                {s.price_sek > 0 ? ` · ${s.price_sek} kr` : ""}
                {!s.active ? " · Inaktiv" : ""}
              </span>
              <form action={toggleServiceActive.bind(null, s.id, !s.active)}>
                <button type="submit" className={styles.smallGhostBtn}>
                  {s.active ? "Inaktivera" : "Aktivera"}
                </button>
              </form>
            </div>
          ))}
          {services.length === 0 && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>Inga tjänster ännu.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <p style={{ color: "var(--warm)", fontSize: "0.85rem" }}>{error}</p>}
          <input
            placeholder="Namn på tjänst"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-soft)", flex: 1 }}>
              Tid (minuter)
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min={5}
                required
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-soft)", flex: 1 }}>
              Pris
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Sparar..." : "+ Lägg till tjänst"}
          </button>
        </form>
      </div>
    </div>
  );
}
