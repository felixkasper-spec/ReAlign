"use client";

import { useRef, useState, useTransition } from "react";
import {
  searchProfilesForLink,
  linkCustomerLogin,
  unlinkCustomerLogin,
  type ProfileMatch,
} from "../actions";
import styles from "../kunder.module.css";

export type LinkedProfile = { userId: string; email: string; displayName: string | null };

// Kopplar kundens telefonprofil till ett inlogg (profiles-rad) — så att
// coachens meddelande-inkorg (se app/coaching/page.tsx) tydligt kan visa
// vem en chatt-tråd faktiskt tillhör, istället för bara ett mejl/konto-id.
export default function LoginLink({
  phone,
  customerName,
  linkedProfile,
}: {
  phone: string;
  customerName: string;
  linkedProfile: LinkedProfile | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileMatch[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    setError(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setResults(await searchProfilesForLink(value));
    }, 250);
  }

  function handleLink(profile: ProfileMatch) {
    startTransition(async () => {
      const result = await linkCustomerLogin(phone, profile.id, customerName);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      setQuery("");
      setResults([]);
    });
  }

  function handleUnlink() {
    startTransition(async () => {
      await unlinkCustomerLogin(phone);
    });
  }

  if (linkedProfile) {
    return (
      <div className={styles.loginLink}>
        <span>
          Kopplat inlogg: <b>{linkedProfile.displayName || linkedProfile.email}</b>
          {linkedProfile.displayName && ` (${linkedProfile.email})`}
        </span>
        <button type="button" onClick={handleUnlink} className={styles.deleteBtn} disabled={pending}>
          {pending ? "Tar bort..." : "Ta bort koppling"}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.loginLink} style={{ position: "relative" }}>
      <input
        type="search"
        placeholder="Koppla till inlogg (sök mejl/namn)..."
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        className={styles.loginLinkInput}
        disabled={pending}
      />
      {error && <span style={{ color: "var(--warm)", fontSize: "0.78rem" }}>{error}</span>}
      {results.length > 0 && (
        <div className={styles.loginLinkResults}>
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.loginLinkResultRow}
              onClick={() => handleLink(p)}
              disabled={pending}
            >
              <strong>{p.displayName || p.email}</strong>
              {p.displayName && <span>{p.email}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
