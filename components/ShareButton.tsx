"use client";

import { useState } from "react";
import styles from "./ShareButton.module.css";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // användaren avbröt delningen — inget att göra
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
      onClick={handleClick}
      className={`${styles.shareBtn} ${copied ? styles.copied : ""}`}
    >
      {copied ? "Länk kopierad ✓" : "↗ Dela"}
    </button>
  );
}
