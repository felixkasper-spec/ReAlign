"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPackage, updatePackage, deletePackage, type PackagePatch } from "../../upplagg/actions";
import styles from "../kunder.module.css";
import listStyles from "../../page.module.css";

export type UpplaggRow = {
  id: string;
  sessions_used: number;
  sessions_purchased: number;
  note_1: string | null;
};

const numberInputStyle: React.CSSProperties = {
  width: 44,
  padding: "5px 6px",
  borderRadius: 8,
  border: "1px solid var(--line)",
  textAlign: "center",
  font: "inherit",
  fontSize: "0.85rem",
};

// Ett upplägg i taget, redigerbart direkt här — samma spara-på-blur-mönster
// som den stora Upplägg-tavlan (se /coaching/upplagg), portat från Cleer
// Klinik men utan duration/behandlare-fälten (finns inte i ReAligns
// client_packages — en enda delad tavla, ingen Felix/Christopher-uppdelning).
function UpplaggRowCard({ pkg }: { pkg: UpplaggRow }) {
  const [used, setUsed] = useState(String(pkg.sessions_used));
  const [purchased, setPurchased] = useState(String(pkg.sessions_purchased));
  const [note, setNote] = useState(pkg.note_1 ?? "");
  const [, startTransition] = useTransition();

  function save(patch: PackagePatch) {
    startTransition(() => {
      updatePackage(pkg.id, patch);
    });
  }

  return (
    <div className={styles.card}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-soft)" }}>Sessioner</span>
          <input
            type="text"
            inputMode="numeric"
            value={used}
            onChange={(e) => setUsed(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={() => {
              const n = Math.max(0, Math.round(Number(used || 0)));
              setUsed(String(n));
              if (n !== pkg.sessions_used) save({ sessions_used: n });
            }}
            style={numberInputStyle}
          />
          <span style={{ color: "var(--text-soft)" }}>/</span>
          <input
            type="text"
            inputMode="numeric"
            value={purchased}
            onChange={(e) => setPurchased(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={() => {
              const n = Math.max(0, Math.round(Number(purchased || 0)));
              setPurchased(String(n));
              if (n !== pkg.sessions_purchased) save({ sessions_purchased: n });
            }}
            style={numberInputStyle}
          />
        </div>
        <button
          type="button"
          onClick={() => deletePackage(pkg.id)}
          className={styles.deleteBtn}
          style={{ marginLeft: "auto" }}
        >
          Ta bort
        </button>
      </div>

      <input
        type="text"
        placeholder="Anteckning (valfritt)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          if (note !== (pkg.note_1 ?? "")) save({ note_1: note });
        }}
        style={{
          width: "100%",
          padding: "7px 10px",
          borderRadius: 8,
          border: "1px solid var(--line)",
          font: "inherit",
          fontSize: "0.85rem",
        }}
      />
    </div>
  );
}

// Skapar alltid med kundens namn/telefon hämtat från sidan den står på —
// inget fritextnamn att skriva fel, till skillnad från den fristående
// Upplägg-tavlan.
function NewUpplaggForm({
  customerPhone,
  customerName,
  onCreated,
}: {
  customerPhone: string;
  customerName: string;
  onCreated: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createPackage(customerName, customerPhone);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      onCreated();
    });
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
      <button
        type="button"
        className="btn btn-primary"
        style={{ padding: "6px 14px" }}
        onClick={handleCreate}
        disabled={pending}
      >
        {pending ? "Lägger till..." : "+ Nytt upplägg"}
      </button>
      {error && <p style={{ color: "var(--warm)", fontSize: "0.82rem", width: "100%" }}>{error}</p>}
    </div>
  );
}

export default function UpplaggCard({
  customerPhone,
  customerName,
  packages,
}: {
  customerPhone: string;
  customerName: string;
  packages: UpplaggRow[];
}) {
  const router = useRouter();

  return (
    <details className={styles.dropdownCard}>
      <summary className={styles.dropdownSummary}>
        Upplägg
        <span className={styles.dropdownHint}>{packages.length}</span>
      </summary>
      <div className={styles.dropdownBody}>
        <NewUpplaggForm
          customerPhone={customerPhone}
          customerName={customerName}
          onCreated={() => router.refresh()}
        />
        {packages.length === 0 && <p className={listStyles.empty}>Inga upplägg skapade än.</p>}
        {packages.map((pkg) => (
          <UpplaggRowCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </details>
  );
}
