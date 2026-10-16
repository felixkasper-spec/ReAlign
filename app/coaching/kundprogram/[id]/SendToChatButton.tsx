"use client";

import { useState, useTransition } from "react";
import { sendProgramLinkToChat } from "../../actions";

// Skickar programlänken som ett chattmeddelande till kunden — bara relevant
// när kunden faktiskt har ett kopplat konto (userId), annars finns ingen
// chatt att skicka i (se villkorad rendering hos anroparna).
export default function SendToChatButton({
  userId,
  clinicProgramId,
}: {
  userId: string;
  clinicProgramId: string;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setStatus("idle");
    startTransition(async () => {
      const result = await sendProgramLinkToChat(userId, clinicProgramId);
      setStatus(result.ok ? "success" : "error");
    });
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ border: "1px solid var(--line)" }}
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? "Skickar..." : "Skicka i chatt"}
      </button>
      {status === "success" && (
        <span style={{ color: "var(--sage)", fontSize: "0.85rem" }}>✓ Skickat</span>
      )}
      {status === "error" && (
        <span style={{ color: "var(--warm)", fontSize: "0.85rem" }}>Något gick fel</span>
      )}
    </span>
  );
}
