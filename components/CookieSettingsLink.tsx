"use client";

import { REOPEN_EVENT } from "./CookieConsent";

export default function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(REOPEN_EVENT))}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        font: "inherit",
        color: "var(--text-soft)",
        cursor: "pointer",
      }}
    >
      Cookie-inställningar
    </button>
  );
}
