"use client";

import { useMemo, useState } from "react";
import PackageTable, { type PackageRow } from "./PackageTable";
import AddPackageForm from "./AddPackageForm";
import styles from "./upplagg.module.css";

export default function UpplaggBoard({ packages }: { packages: PackageRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return packages;
    return packages.filter(
      (p) =>
        p.customer_name.toLowerCase().includes(q) ||
        (p.note_1 ?? "").toLowerCase().includes(q) ||
        (p.note_2 ?? "").toLowerCase().includes(q),
    );
  }, [packages, query]);

  const active = filtered.filter((p) => p.status === "active");
  const inactive = filtered.filter((p) => p.status === "inactive");
  const completed = filtered.filter((p) => p.status === "completed");

  return (
    <>
      <div className={styles.toolbar}>
        <AddPackageForm />
        <input
          type="search"
          placeholder="Sök upplägg (namn, anteckning)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>Pågående</div>
      {active.length === 0 ? (
        <p className={styles.empty}>
          {query ? "Inget upplägg matchade sökningen." : "Inga pågående upplägg än."}
        </p>
      ) : (
        <PackageTable packages={active} />
      )}

      {inactive.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>
            Inaktiva ({inactive.length})
          </div>
          <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", marginBottom: 12 }}>
            Har sessioner kvar men ingen bokad tid just nu.
          </p>
          <PackageTable packages={inactive} />
        </div>
      )}

      {completed.length > 0 && (
        <details style={{ marginTop: 32 }}>
          <summary style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12, cursor: "pointer" }}>
            Avslutade upplägg ({completed.length})
          </summary>
          <div style={{ marginTop: 12 }}>
            <PackageTable packages={completed} />
          </div>
        </details>
      )}
    </>
  );
}
