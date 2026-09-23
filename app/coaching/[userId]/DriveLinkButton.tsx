"use client";

import { useState, useTransition } from "react";
import { updateCoachingDriveLink } from "../actions";

// Länk till en Google Drive-mapp coachen delat manuellt med kunden (se
// migration 0073) — för filer som är för stora/otympliga för chattens
// inbyggda bilaga (25MB-tak). Ingen Drive-integration, bara en lagrad URL.
export default function DriveLinkButton({
  userId,
  initialUrl,
}: {
  userId: string;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialUrl ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const trimmed = value.trim();
      const result = await updateCoachingDriveLink(userId, trimmed);
      if (result.ok) {
        setUrl(trimmed || null);
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Klistra in Drive-länk (filförfrågan)"
          style={{
            fontSize: "0.82rem",
            padding: "7px 10px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            minWidth: 220,
          }}
        />
        <button
          type="button"
          className="btn btn-ghost"
          style={{ border: "1px solid var(--line)" }}
          onClick={save}
          disabled={pending}
        >
          {pending ? "Sparar..." : "Spara"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ border: "1px solid var(--line)" }}
          onClick={() => {
            setEditing(false);
            setValue(url ?? "");
          }}
          disabled={pending}
        >
          Avbryt
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ border: "1px solid var(--line)", flexShrink: 0 }}
        >
          📁 Drive-mapp →
        </a>
      )}
      <button
        type="button"
        className="btn btn-ghost"
        style={{ border: "1px solid var(--line)", fontSize: "0.78rem", flexShrink: 0 }}
        onClick={() => setEditing(true)}
      >
        {url ? "Ändra" : "+ Drive-länk"}
      </button>
    </div>
  );
}
