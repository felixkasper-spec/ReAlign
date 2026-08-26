"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchItem } from "@/app/api/search-index/route";
import styles from "./SiteSearch.module.css";

const GROUP_ORDER = ["Sidor", "Funktioner", "Program", "Övningar"];
const MAX_PER_GROUP = 6;

export default function SiteSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (open && items === null) {
      fetch("/api/search-index")
        .then((r) => r.json())
        .then((data) => setItems(data.items))
        .catch(() => setItems([]));
    }
    if (open) {
      inputRef.current?.focus();
    }
  }, [open, items]);

  const grouped = useMemo(() => {
    if (!items || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const matches = items.filter((i) => i.title.toLowerCase().includes(q));

    const byGroup = new Map<string, SearchItem[]>();
    for (const item of matches) {
      const list = byGroup.get(item.group) ?? [];
      if (list.length < MAX_PER_GROUP) list.push(item);
      byGroup.set(item.group, list);
    }
    return GROUP_ORDER.filter((g) => byGroup.has(g)).map((g) => ({
      group: g,
      results: byGroup.get(g)!,
    }));
  }, [items, query]);

  function go(href: string) {
    setQuery("");
    onClose();
    router.push(href);
  }

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputRow}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök sidor, program, övningar, funktioner..."
            className={styles.input}
          />
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Esc
          </button>
        </div>
        <div className={styles.results}>
          {!query.trim() && <p className={styles.hint}>Börja skriva för att söka.</p>}
          {query.trim() && grouped.length === 0 && (
            <p className={styles.empty}>Inga träffar för &quot;{query}&quot;.</p>
          )}
          {grouped.map(({ group, results }) => (
            <div key={group}>
              <div className={styles.groupLabel}>{group}</div>
              {results.map((r) => (
                <a
                  key={r.href + r.title}
                  href={r.href}
                  className={styles.resultRow}
                  onClick={(e) => {
                    e.preventDefault();
                    go(r.href);
                  }}
                >
                  {r.title}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
