"use client";

import { useState, useTransition } from "react";
import { updatePackage, setPackageStatus, deletePackage, type PackagePatch } from "./actions";
import styles from "./upplagg.module.css";

export type PackageRow = {
  id: string;
  customer_name: string;
  sessions_used: number;
  sessions_purchased: number;
  note_1: string | null;
  note_2: string | null;
  status: "active" | "inactive" | "completed";
};

function PackageTableRow({ pkg }: { pkg: PackageRow }) {
  const [name, setName] = useState(pkg.customer_name);
  const [used, setUsed] = useState(String(pkg.sessions_used));
  const [purchased, setPurchased] = useState(String(pkg.sessions_purchased));
  const [note1, setNote1] = useState(pkg.note_1 ?? "");
  const [note2, setNote2] = useState(pkg.note_2 ?? "");
  const [, startTransition] = useTransition();

  function save(patch: PackagePatch) {
    startTransition(() => {
      updatePackage(pkg.id, patch);
    });
  }

  return (
    <>
      <div className={styles.cell}>
        <input
          className={styles.cellInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim() && name !== pkg.customer_name) save({ customer_name: name.trim() });
          }}
        />
      </div>
      <div className={`${styles.cell} ${styles.sessionsCell}`}>
        <input
          type="text"
          inputMode="numeric"
          className={styles.sessionsInput}
          value={used}
          onChange={(e) => setUsed(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={() => {
            const n = Number(used || 0);
            if (Number.isFinite(n) && n !== pkg.sessions_used) {
              save({ sessions_used: Math.max(0, Math.round(n)) });
            }
            setUsed(String(Math.max(0, Math.round(Number(used || 0)))));
          }}
        />
        <span className={styles.sessionsSep}>/</span>
        <input
          type="text"
          inputMode="numeric"
          className={styles.sessionsInput}
          value={purchased}
          onChange={(e) => setPurchased(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={() => {
            const n = Number(purchased || 0);
            if (Number.isFinite(n) && n !== pkg.sessions_purchased) {
              save({ sessions_purchased: Math.max(0, Math.round(n)) });
            }
            setPurchased(String(Math.max(0, Math.round(Number(purchased || 0)))));
          }}
        />
      </div>
      <div className={styles.cell}>
        <input
          className={styles.cellInput}
          value={note1}
          placeholder="—"
          onChange={(e) => setNote1(e.target.value)}
          onBlur={() => {
            if (note1 !== (pkg.note_1 ?? "")) save({ note_1: note1 });
          }}
        />
      </div>
      <div className={styles.cell}>
        <input
          className={styles.cellInput}
          value={note2}
          placeholder="—"
          onChange={(e) => setNote2(e.target.value)}
          onBlur={() => {
            if (note2 !== (pkg.note_2 ?? "")) save({ note_2: note2 });
          }}
        />
      </div>
      <div className={`${styles.cell} ${styles.actionsCell}`}>
        {pkg.status === "active" && (
          <>
            <button type="button" className={styles.iconBtn} onClick={() => setPackageStatus(pkg.id, "inactive")}>
              Inaktiv
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => setPackageStatus(pkg.id, "completed")}>
              Slutförd
            </button>
          </>
        )}
        {pkg.status === "inactive" && (
          <>
            <button type="button" className={styles.iconBtn} onClick={() => setPackageStatus(pkg.id, "active")}>
              Aktivera
            </button>
            <button type="button" className={styles.iconBtn} onClick={() => setPackageStatus(pkg.id, "completed")}>
              Slutförd
            </button>
          </>
        )}
        {pkg.status === "completed" && (
          <button type="button" className={styles.iconBtn} onClick={() => setPackageStatus(pkg.id, "active")}>
            Återuppta
          </button>
        )}
        <button type="button" className={styles.iconBtn} onClick={() => deletePackage(pkg.id)}>
          Ta bort
        </button>
      </div>
    </>
  );
}

export default function PackageTable({ packages }: { packages: PackageRow[] }) {
  return (
    <div className={styles.tableWrap}>
      <div className={styles.table}>
        <div className={styles.headerCell}>Namn</div>
        <div className={styles.headerCell}>Sessioner</div>
        <div className={styles.headerCell}>Anteckning 1</div>
        <div className={styles.headerCell}>Anteckning 2</div>
        <div className={styles.headerCell} />
        {packages.map((pkg) => (
          <PackageTableRow key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </div>
  );
}
