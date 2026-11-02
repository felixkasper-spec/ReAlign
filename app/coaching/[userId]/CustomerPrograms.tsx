"use client";

import { useActionState, useState } from "react";
import ClinicProgramBuilder, {
  type Exercise,
  type SelectedRow,
} from "../kundprogram/ClinicProgramBuilder";
import { updateClinicProgramInline, type UpdateProgramResult } from "../kundprogram/actions";
import styles from "../page.module.css";

const INITIAL_STATE: UpdateProgramResult = { ok: false, error: "" };

export type CustomerProgram = {
  id: string;
  label: string;
  createdAt: string;
  initialSelected: SelectedRow[];
};

// Ett program i taget expanderas (byggaren mountas bara då) — annars skulle
// flera tunga ClinicProgramBuilder-instanser (med egen videouppladdning,
// "Alla övningar"-lista osv.) alltid ligga kvar i DOM:en för alla program en
// kund har, även de man inte tittar på.
function EditableProgram({ program, exercises }: { program: CustomerProgram; exercises: Exercise[] }) {
  const [state, formAction] = useActionState(
    updateClinicProgramInline.bind(null, program.id),
    INITIAL_STATE,
  );

  return (
    <div style={{ marginTop: 12 }}>
      {state.ok && (
        <p style={{ color: "var(--sage)", fontSize: "0.88rem", marginBottom: 10 }}>
          ✓ Ändringarna sparade.
        </p>
      )}
      {!state.ok && state.error && (
        <p style={{ color: "var(--warm)", fontSize: "0.88rem", marginBottom: 10 }}>{state.error}</p>
      )}
      <ClinicProgramBuilder
        exercises={exercises}
        action={formAction}
        initialLabel={program.label}
        initialSelected={program.initialSelected}
        submitLabel="Spara ändringar →"
        submitPendingText="Sparar..."
      />
    </div>
  );
}

function ProgramRow({ program, exercises }: { program: CustomerProgram; exercises: Exercise[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "10px 14px",
      }}
    >
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
          fontSize: "0.88rem",
        }}
      >
        <span>
          <strong>{program.label}</strong>{" "}
          <span style={{ color: "var(--text-soft)" }}>
            · {new Date(program.createdAt).toLocaleDateString("sv-SE", { dateStyle: "medium" })}
          </span>
        </span>
        <span style={{ color: "var(--text-soft)" }}>{open ? "▲" : "Redigera ▼"}</span>
      </button>
      {open && <EditableProgram program={program} exercises={exercises} />}
    </div>
  );
}

export default function CustomerPrograms({
  programs,
  exercises,
}: {
  programs: CustomerProgram[];
  exercises: Exercise[];
}) {
  if (programs.length === 0) return null;

  return (
    <div className={styles.card} style={{ padding: "16px 18px", marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>
        Tidigare program ({programs.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {programs.map((program) => (
          <ProgramRow key={program.id} program={program} exercises={exercises} />
        ))}
      </div>
    </div>
  );
}
