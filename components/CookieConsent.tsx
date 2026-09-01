"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { applyConsent, getStoredConsent } from "@/lib/consent";
import styles from "./CookieConsent.module.css";

export const REOPEN_EVENT = "realign:open-cookie-settings";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // queueMicrotask: localStorage finns bara i webbläsaren, så värdet är
    // först känt efter mount — en riktig extern källa vi synkar från, inte
    // state vi kunde räknat ut direkt under rendering.
    queueMicrotask(() => {
      const stored = getStoredConsent();
      if (stored) {
        // Standardläget sätts till "denied" på varje ny sidladdning (innan
        // GTM ens laddat) — en återkommande besökare som redan gett
        // samtycke måste därför få det återbekräftat här, annars nollställs
        // det.
        applyConsent(stored);
      } else {
        setVisible(true);
      }
    });

    function reopen() {
      setVisible(true);
    }
    window.addEventListener(REOPEN_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_EVENT, reopen);
  }, []);

  function choose(choice: "granted" | "denied") {
    applyConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookiesamtycke">
      <p>
        Vi använder cookies som krävs för att sajten ska fungera, och — om du
        godkänner — för statistik och marknadsföring. Läs mer i vår{" "}
        <Link href="/integritetspolicy">integritetspolicy</Link>.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ border: "1px solid var(--line)" }}
          onClick={() => choose("denied")}
        >
          Endast nödvändiga
        </button>
        <button type="button" className="btn btn-primary" onClick={() => choose("granted")}>
          Godkänn alla
        </button>
      </div>
    </div>
  );
}
