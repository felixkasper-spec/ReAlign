"use client";

import { useState, useTransition } from "react";
import { sendIntakeFormEmail } from "../actions";

// Enkel en-klicks-knapp eftersom kundens mejladress redan är känd (ingen
// anledning att be coachen skriva in den igen, till skillnad från
// kundprogrammens SendLinkForm som kan skickas till vem som helst).
export default function SendIntakeEmailButton({
  email,
  formUrl,
}: {
  email: string;
  formUrl: string;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await sendIntakeFormEmail(email, formUrl);
      setStatus(result.ok ? "success" : "error");
    });
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={handleClick}
        className="btn btn-ghost"
        style={{ border: "1px solid var(--line)" }}
        disabled={pending}
      >
        {pending ? "Skickar..." : "Skicka via mejl"}
      </button>
      {status === "success" && (
        <span style={{ color: "var(--sage)", fontSize: "0.82rem" }}>✓ Skickat</span>
      )}
      {status === "error" && (
        <span style={{ color: "var(--warm)", fontSize: "0.82rem" }}>Något gick fel</span>
      )}
    </span>
  );
}
