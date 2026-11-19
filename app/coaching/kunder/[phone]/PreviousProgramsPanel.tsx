"use client";

import { useState } from "react";
import Link from "next/link";
import type { SelectedRow } from "../../kundprogram/ClinicProgramBuilder";
import styles from "../../../min-sida/bygg-program/page.module.css";

// Ligger här lokalt istället för att importeras från en kundchatt-mapp
// (som Cleers motsvarighet gör) — ReAlign har inte den filstrukturen än.
export type CustomerProgram = {
  id: string;
  label: string;
  createdAt: string;
  initialSelected: SelectedRow[];
};

function exerciseLine(row: SelectedRow): string {
  return row.notes ? `${row.title} - ${row.notes}` : row.title;
}

// Läsvy av ett tidigare program — bara till för att snabbt kika/återanvända,
// inte redigera på plats. Tre sätt att gå vidare: kopiera som text
// (urklipp), kopiera in exakt de övningarna i byggaren nedanför (via
// onCopyToBuilder), eller gå till den riktiga redigera-sidan om man vill
// ändra det befintliga programmet (samma länk, inget nytt skapas).
function PreviousProgramRow({
  program,
  onCopyToBuilder,
}: {
  program: CustomerProgram;
  onCopyToBuilder: (rows: SelectedRow[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopyText() {
    const text = program.initialSelected.map(exerciseLine).join("\n");
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <li className={styles.row} style={{ display: "block", cursor: "default" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          all: "unset",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          cursor: "pointer",
        }}
      >
        <span className={styles.rowTitle}>{program.label}</span>
        <span className={styles.rowMeta}>
          {new Date(program.createdAt).toLocaleDateString("sv-SE", { dateStyle: "medium" })}
          {" · "}
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {program.initialSelected.length === 0 ? (
            <p className={styles.hint}>Inga övningar i det här programmet.</p>
          ) : (
            <ul className={styles.list} style={{ maxHeight: "none", marginBottom: 12 }}>
              {program.initialSelected.map((row) => (
                <li key={row.rowId}>
                  <div className={styles.rowTitle}>{row.title}</div>
                  {row.notes && <div className={styles.rowMeta}>{row.notes}</div>}
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} onClick={handleCopyText}>
              {copied ? "Kopierat ✓" : "Kopiera"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ border: "1px solid var(--line)" }}
              onClick={() => onCopyToBuilder(program.initialSelected)}
            >
              Kopiera till programbyggare
            </button>
            <Link href={`/coaching/kundprogram/${program.id}/redigera`} className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>
              Redigera program →
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}

export default function PreviousProgramsPanel({
  programs,
  onCopyToBuilder,
}: {
  programs: CustomerProgram[];
  onCopyToBuilder: (rows: SelectedRow[]) => void;
}) {
  return (
    <details className={styles.panel}>
      <summary className={styles.panelSummary}>Tidigare program ({programs.length})</summary>
      {programs.length === 0 ? (
        <p className={styles.hint}>Inga tidigare program.</p>
      ) : (
        <ul className={styles.list} style={{ maxHeight: "none" }}>
          {programs.map((program) => (
            <PreviousProgramRow key={program.id} program={program} onCopyToBuilder={onCopyToBuilder} />
          ))}
        </ul>
      )}
    </details>
  );
}
