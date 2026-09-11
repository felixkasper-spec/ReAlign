"use client";

import { useState, useTransition } from "react";
import { sendClinicProgramLink } from "../actions";
import styles from "../../../min-sida/bygg-program/page.module.css";

export default function SendLinkForm({
  clinicProgramId,
}: {
  clinicProgramId: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email);
      const result = await sendClinicProgramLink(clinicProgramId, formData);
      if (result.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setStatus("idle");
        }}
        placeholder="Kundens mejladress"
        required
        className={styles.searchInput}
        style={{ marginBottom: 0, flex: 1, minWidth: 200 }}
      />
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? "Skickar..." : "Skicka via mail"}
      </button>
      {status === "success" && (
        <span
          style={{ color: "var(--sage)", fontSize: "0.85rem", width: "100%" }}
        >
          ✓ Mejl skickat.
        </span>
      )}
      {status === "error" && (
        <span
          style={{ color: "var(--warm)", fontSize: "0.85rem", width: "100%" }}
        >
          Något gick fel — kontrollera adressen och testa igen.
        </span>
      )}
    </form>
  );
}
