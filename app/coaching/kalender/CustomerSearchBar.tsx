"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchCustomers, type CustomerMatch } from "./actions";
import styles from "./admin-shell.module.css";

export default function CustomerSearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CustomerMatch[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  function handleChange(value: string) {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setSuggestions(await searchCustomers(value));
    }, 250);
  }

  function handleSelect(customer: CustomerMatch) {
    setSuggestions([]);
    setQuery("");
    router.push(`/coaching/kunder/${customer.phone}`);
  }

  return (
    <div className={styles.customerSearch}>
      <input
        type="search"
        placeholder="Sök kund (namn, telefon, mejl)..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
      />
      {suggestions.length > 0 && (
        <div className={styles.customerSuggestions}>
          {suggestions.map((c) => (
            <button
              key={c.phone}
              type="button"
              className={styles.customerSuggestionRow}
              onClick={() => handleSelect(c)}
            >
              <strong>{c.name}</strong>
              <span>
                {c.phone}
                {c.email ? ` · ${c.email}` : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
