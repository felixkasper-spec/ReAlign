"use client";

import { useMemo, useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import styles from "../../min-sida/bygg-program/page.module.css";

type Exercise = { id: string; slug: string; title: string; body_part: string };
export type SelectedRow = { id: string; title: string; notes: string };

function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9åäö]+/g, " ")
    .trim();
}

// När en förkortning krockar mellan flera övningar (t.ex. "sc" för både
// Spidey Crawls och Standing Curlpress), avgör denna listan vilken som ska
// väljas istället för att lämnas som omatchad.
const ACRONYM_PREFERENCES = new Set(
  [
    "Crocodile Crunches",
    "Postural Plank",
    "Standing Arm Circles",
    "Spidey Crawls",
    "Standups",
    "Cablecross - One Arm Pulldown",
  ].map(normalize)
);

// Initialförkortning av en titel, t.ex. "Hooklying knee squeezes" -> "hks".
function acronym(title: string) {
  return normalize(title)
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("");
}

// Levenshtein-avstånd (antal enstaka tecken-ändringar mellan två strängar),
// används för att fånga upp stavfel i sista fallback-steget.
function levenshtein(a: string, b: string) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const row = [i];
    for (let j = 1; j <= n; j++) {
      row[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], row[j - 1]);
    }
    prev = row;
  }
  return prev[n];
}

// Hittar bästa matchande övning för en fritextrad som "Spidey crawls" eller
// en förkortning som "sc". Ordning: exakt titel -> unik initialförkortning
// (t.ex. "hks" för Hooklying knee squeezes) -> startar-med/innehåller ->
// stavfelstolerant (Levenshtein) som sista fallback.
function findMatch(name: string, exercises: Exercise[]): Exercise | null {
  const q = normalize(name);
  if (!q) return null;

  const exact = exercises.find((e) => normalize(e.title) === q);
  if (exact) return exact;

  if (q.length >= 1 && !q.includes(" ")) {
    const acronymHits = exercises.filter((e) => acronym(e.title) === q);
    if (acronymHits.length === 1) return acronymHits[0];
    if (acronymHits.length > 1) {
      const preferred = acronymHits.filter((e) => ACRONYM_PREFERENCES.has(normalize(e.title)));
      if (preferred.length === 1) return preferred[0];
    }
  }

  const partial =
    exercises.find((e) => {
      const t = normalize(e.title);
      return t.startsWith(q) || q.startsWith(t);
    }) ??
    exercises.find((e) => {
      const t = normalize(e.title);
      return t.includes(q) || q.includes(t);
    });
  if (partial) return partial;

  if (q.length >= 3) {
    let best: Exercise | null = null;
    let bestDist = Infinity;
    for (const e of exercises) {
      const t = normalize(e.title);
      const dist = levenshtein(q, t);
      const threshold = Math.min(4, Math.max(1, Math.floor(Math.max(q.length, t.length) * 0.25)));
      if (dist <= threshold && dist < bestDist) {
        bestDist = dist;
        best = e;
      }
    }
    if (best) return best;
  }

  return null;
}

export default function ClinicProgramBuilder({
  exercises,
  action,
  initialLabel = "",
  initialSelected = [],
  submitLabel = "Skapa länk →",
  submitPendingText = "Skapar...",
}: {
  exercises: Exercise[];
  action: (formData: FormData) => void | Promise<void>;
  initialLabel?: string;
  initialSelected?: SelectedRow[];
  submitLabel?: string;
  submitPendingText?: string;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [notesText, setNotesText] = useState("");
  const [selected, setSelected] = useState<SelectedRow[]>(initialSelected);
  const [unmatchedLines, setUnmatchedLines] = useState<string[]>([]);
  const [renderKey, setRenderKey] = useState(0);
  const [search, setSearch] = useState("");
  const [bodyFilter, setBodyFilter] = useState("");

  const selectedSet = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  const bodyParts = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const e of exercises) {
      if (!seen.has(e.body_part)) {
        seen.add(e.body_part);
        list.push(e.body_part);
      }
    }
    return list;
  }, [exercises]);

  const available = exercises
    .filter((e) => !selectedSet.has(e.id))
    .filter((e) => !bodyFilter || e.body_part === bodyFilter)
    .filter((e) => !search.trim() || e.title.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => a.title.localeCompare(b.title));

  function parseNotes() {
    const lines = notesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const matched: SelectedRow[] = [];
    const unmatched: string[] = [];

    for (const line of lines) {
      const m = line.match(/^(.*?)\s*[-–—]\s*(.*)$/);
      const namePart = m ? m[1] : line;
      const notePart = m ? m[2] : "";
      const ex = findMatch(namePart, exercises);
      if (ex) {
        matched.push({ id: ex.id, title: ex.title, notes: notePart });
      } else {
        unmatched.push(line);
      }
    }

    setSelected(matched);
    setUnmatchedLines(unmatched);
    setRenderKey((k) => k + 1);
  }

  function add(ex: Exercise) {
    setSelected((prev) => [...prev, { id: ex.id, title: ex.title, notes: "" }]);
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className={styles.builder}>
      <div className={styles.panel}>
        <h2>Klistra in anteckningar</h2>
        <textarea
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          placeholder={"Spidey crawls - 2x45 sekunder\nSitting knee squeezes - 2x10 upp till 50%"}
          rows={8}
          className={styles.searchInput}
          style={{ resize: "vertical", fontFamily: "inherit" }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={parseNotes}
          disabled={!notesText.trim()}
        >
          Tolka text →
        </button>

        {unmatchedLines.length > 0 && (
          <p className={styles.hint} style={{ color: "var(--warm)", marginTop: 12 }}>
            Kunde inte hitta matchande övning för {unmatchedLines.length} rad
            {unmatchedLines.length > 1 ? "er" : ""}, lägg till för hand nedan:
            <br />
            {unmatchedLines.map((l, i) => (
              <span key={i}>
                &quot;{l}&quot;
                <br />
              </span>
            ))}
          </p>
        )}
      </div>

      <form action={action} className={styles.builder}>
        <div className={styles.cols}>
          <div className={styles.panel}>
            <h2>Alla övningar</h2>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Sök övning..."
              className={styles.searchInput}
            />

            <div className={styles.filterRow}>
              <button
                type="button"
                className={`${styles.filterChip} ${bodyFilter === "" ? styles.filterChipActive : ""}`}
                onClick={() => setBodyFilter("")}
              >
                Alla
              </button>
              {bodyParts.map((bp) => (
                <button
                  key={bp}
                  type="button"
                  className={`${styles.filterChip} ${bodyFilter === bp ? styles.filterChipActive : ""}`}
                  onClick={() => setBodyFilter(bp)}
                >
                  {bp}
                </button>
              ))}
            </div>

            {available.length === 0 ? (
              <p className={styles.hint}>Inga övningar matchade.</p>
            ) : (
              <ul className={styles.list}>
                {available.map((ex) => (
                  <li key={ex.id} className={styles.row}>
                    <div>
                      <div className={styles.rowTitle}>{ex.title}</div>
                      <div className={styles.rowMeta}>{ex.body_part}</div>
                    </div>
                    <button type="button" className={styles.addBtn} onClick={() => add(ex)}>
                      + Lägg till
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.panel}>
            <h2>Kundens program ({selected.length})</h2>
            {selected.length === 0 ? (
              <p className={styles.hint}>
                Tolka en anteckningstext ovan, eller lägg till övningar för hand från listan
                till vänster.
              </p>
            ) : (
              <ul className={styles.list}>
                {selected.map((row, i) => (
                  <li key={`${renderKey}-${row.id}`} className={styles.row}>
                    <span className={styles.num}>{i + 1}</span>
                    <div className={styles.rowBody}>
                      <div className={styles.rowTitle}>{row.title}</div>
                      <input
                        type="text"
                        name="notes"
                        defaultValue={row.notes}
                        placeholder="Sets/reps, t.ex. 2x12"
                        className={styles.searchInput}
                        style={{ marginTop: 4, marginBottom: 0, padding: "6px 10px" }}
                      />
                    </div>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label="Flytta upp"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => move(i, 1)}
                        disabled={i === selected.length - 1}
                        aria-label="Flytta ner"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => remove(row.id)}
                        aria-label="Ta bort"
                      >
                        ✕
                      </button>
                    </div>
                    <input type="hidden" name="exerciseIds" value={row.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.saveRow}>
          <input
            type="text"
            name="label"
            placeholder="Namn/anteckning (t.ex. Anna K – vecka 1)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className={styles.textInput}
          />
          <SubmitButton
            className="btn btn-primary"
            pendingText={submitPendingText}
            disabled={selected.length === 0}
          >
            {submitLabel}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
