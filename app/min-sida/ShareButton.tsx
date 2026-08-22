"use client";

import { useState } from "react";

export default function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const text =
      "Jag använder ReAlign Metoden för hållningsträning — kolla in det här:";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "ReAlign Metoden", text, url });
      } catch {
        // Användaren avbröt delningsdialogen — inget att göra.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{ width: "100%", border: "1px solid var(--line)" }}
      onClick={handleClick}
    >
      {copied ? "Länk kopierad ✓" : "Dela länk →"}
    </button>
  );
}
