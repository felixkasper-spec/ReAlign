"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toInternationalPhone } from "@/lib/customer-identity";
import ClinicProgramBuilder, { type Exercise } from "../../kundprogram/ClinicProgramBuilder";
import { createClinicProgramInline, type CreateProgramResult } from "../../kundprogram/actions";
import CopyLinkButton from "../../kundprogram/[id]/CopyLinkButton";
import SendLinkForm from "../../kundprogram/[id]/SendLinkForm";
import JournalComposer from "./JournalComposer";
import JournalEntryItem, { type JournalEntry } from "./JournalEntryItem";
import styles from "../kunder.module.css";

const INITIAL_STATE: CreateProgramResult = { ok: false, error: "" };

// Binder ihop journalen och programbyggaren på kundens sida: klicka "→ Gör
// till program" på en anteckning (eller markera bara en del av texten
// innan du klickar) för att skicka den till "Tolka text" i byggaren nedan,
// direkt på samma sida — se app/coaching/kundprogram/ClinicProgramBuilder.tsx
// för själva tolkningslogiken, som redan fanns för den fristående
// programsidan.
export default function ProgramFromJournal({
  customerPhone,
  customerName,
  customerEmail,
  journalEntries,
  exercises,
  baseUrl,
}: {
  customerPhone: string;
  customerName: string;
  customerEmail: string | null;
  journalEntries: JournalEntry[];
  exercises: Exercise[];
  baseUrl: string;
}) {
  const [prefillText, setPrefillText] = useState("");
  const [prefillVersion, setPrefillVersion] = useState(0);
  const [state, formAction] = useActionState(createClinicProgramInline, INITIAL_STATE);
  const router = useRouter();
  const lastHandledId = useRef<string | null>(null);

  useEffect(() => {
    if (state.ok && state.id !== lastHandledId.current) {
      lastHandledId.current = state.id;
      router.refresh();
    }
  }, [state, router]);

  function handleUseInProgram(text: string) {
    setPrefillText(text);
    setPrefillVersion((v) => v + 1);
    document.getElementById("program-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const shareLink = state.ok ? `${baseUrl}/p/${state.shareToken}` : null;
  const smsHref =
    state.ok && shareLink
      ? `sms:${toInternationalPhone(customerPhone)}&body=${encodeURIComponent(
          `Hej! Här är länken till ditt träningsprogram, ${state.label}: ${shareLink}`,
        )}`
      : null;

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Journal</div>
        <JournalComposer customerPhone={customerPhone} />
        {journalEntries.length === 0 && <p style={{ color: "var(--text-soft)" }}>Inga journalanteckningar än.</p>}
        {journalEntries.map((entry) => (
          <JournalEntryItem
            key={entry.id}
            entry={entry}
            customerPhone={customerPhone}
            onUseInProgram={handleUseInProgram}
          />
        ))}
      </div>

      <div className={styles.section} id="program-builder">
        <div className={styles.sectionTitle}>Skapa program</div>

        {state.ok && shareLink && (
          <div className={styles.card} style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginBottom: 10 }}>✓ &quot;{state.label}&quot; skapat</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <code style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>{shareLink}</code>
              <CopyLinkButton link={shareLink} autoCopy />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <SendLinkForm clinicProgramId={state.id} initialEmail={customerEmail ?? ""} />
              {smsHref && (
                <a href={smsHref} className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>
                  Skicka via sms
                </a>
              )}
            </div>
          </div>
        )}

        {!state.ok && state.error && (
          <p style={{ color: "var(--warm)", fontSize: "0.88rem", marginBottom: 12 }}>{state.error}</p>
        )}

        <ClinicProgramBuilder
          key={`${prefillVersion}-${state.ok ? state.id : "new"}`}
          exercises={exercises}
          action={formAction}
          initialLabel={customerName ? `${customerName} — nytt program` : ""}
          initialNotesText={prefillText}
          autoParseInitial={prefillText.trim().length > 0}
          customerPhone={customerPhone}
          customerName={customerName}
          customerEmail={customerEmail ?? undefined}
          submitLabel="Skapa program →"
          submitPendingText="Skapar..."
        />
      </div>
    </>
  );
}
