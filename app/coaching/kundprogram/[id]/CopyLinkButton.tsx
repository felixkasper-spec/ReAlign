"use client";

import { useState } from "react";

export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Klippbord otillgängligt (t.ex. osäker kontext) — inget att göra åt.
    }
  }

  return (
    <button type="button" className="btn btn-primary" onClick={handleCopy}>
      {copied ? "✓ Kopierad" : "Kopiera länk"}
    </button>
  );
}
