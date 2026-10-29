"use client";

import { useRef, useState, useTransition } from "react";
import { scheduleFollowup, completeFollowup } from "../actions";
import { CADENCE_MESSAGE_TEMPLATES } from "@/lib/cadence-messages";
import styles from "../page.module.css";

export type FollowupRow = {
  id: string;
  note: string | null;
  remind_at: string;
};

// Ad-hoc uppföljningspåminnelse — coachen väljer själv hur många dagar fram
// (t.ex. efter att ha svarat en kund) och en valfri anteckning om vad som
// ska följas upp. "use client" + explicit status krävs numera (till
// skillnad från tidigare) — ett rent formulär mot server actionen gav
// ingen som helst signal om sparningen lyckades eller inte, bara tystnad
// åt bägge hållen.
export default function FollowupScheduler({
  userId,
  customerName,
  active,
}: {
  userId: string;
  customerName: string;
  active: FollowupRow[];
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Fyller bara i anteckningsfältet med den färdiga mallens text — fältet
  // är fortfarande fritt redigerbart efteråt, och select:en nollställs
  // direkt så den inte ser "fastlåst" på ett val ut.
  function applyTemplate(e: React.ChangeEvent<HTMLSelectElement>) {
    const template = CADENCE_MESSAGE_TEMPLATES.find((t) => t.label === e.target.value);
    e.target.value = "";
    if (!template || !noteRef.current) return;
    noteRef.current.value = template.build(customerName);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setStatus("idle");
    setErrorMessage(null);
    startTransition(async () => {
      const result = await scheduleFollowup(userId, formData);
      if (result.ok) {
        setStatus("success");
        formRef.current?.reset();
      } else {
        setStatus("error");
        setErrorMessage(result.error ?? "Kunde inte spara påminnelsen.");
      }
    });
  }

  return (
    <div className={styles.card} style={{ padding: "16px 18px", marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>Schemalägg påminnelse</div>

      {active.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {active.map((f) => (
            <div
              key={f.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                fontSize: "0.85rem",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "8px 12px",
              }}
            >
              <span>
                {new Date(f.remind_at).toLocaleDateString("sv-SE", {
                  dateStyle: "medium",
                })}
                {f.note ? ` — ${f.note}` : ""}
              </span>
              <form action={completeFollowup.bind(null, f.id, userId)}>
                <button type="submit" className="btn btn-ghost" style={{ border: "1px solid var(--line)", flexShrink: 0 }}>
                  Klar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}
      >
        <label style={{ fontSize: "0.82rem" }}>
          Om hur många dagar?
          <br />
          <input
            type="number"
            name="days"
            min={1}
            defaultValue={7}
            required
            style={{
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "6px 10px",
              width: 70,
              fontFamily: "inherit",
            }}
          />
        </label>
        <label style={{ fontSize: "0.82rem", flex: 1, minWidth: 220 }}>
          Anteckning (valfritt)
          <br />
          <select
            onChange={applyTemplate}
            defaultValue=""
            style={{
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "6px 10px",
              width: "100%",
              fontFamily: "inherit",
              boxSizing: "border-box",
              marginBottom: 6,
            }}
          >
            <option value="">Eller välj ett färdigt meddelande från kadensen...</option>
            {CADENCE_MESSAGE_TEMPLATES.map((t) => (
              <option key={t.label} value={t.label}>
                {t.label}
              </option>
            ))}
          </select>
          <textarea
            ref={noteRef}
            name="note"
            placeholder="Vad ska följas upp?"
            rows={3}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "6px 10px",
              width: "100%",
              fontFamily: "inherit",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Sparar..." : "Schemalägg →"}
        </button>
        {status === "success" && (
          <span style={{ color: "var(--sage)", fontSize: "0.85rem", width: "100%" }}>✓ Påminnelse schemalagd.</span>
        )}
        {status === "error" && (
          <span style={{ color: "var(--warm)", fontSize: "0.85rem", width: "100%" }}>{errorMessage}</span>
        )}
      </form>
    </div>
  );
}
