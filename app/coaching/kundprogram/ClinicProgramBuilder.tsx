"use client";

import { useId, useMemo, useRef, useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/client";
import { CLINIC_PROGRAM_VIDEO_BUCKET } from "@/lib/clinic-program-video";
import { createClinicProgramVideoUploadUrl } from "./actions";
import styles from "../../min-sida/bygg-program/page.module.css";

export type Exercise = { id: string; slug: string; title: string; body_part: string };
export type SelectedRow = {
  // Unikt per RAD i programmet — skiljer sig från `id` när samma övning
  // förekommer flera gånger (t.ex. uppvärmning + nedvarvning), så att
  // ta bort/flytta/rendera en specifik rad inte råkar träffa alla rader
  // som råkar peka på samma övning.
  rowId: string;
  id: string;
  title: string;
  notes: string;
  isCustom?: boolean;
  customVideoUrl?: string;
};

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
  ].map(normalize),
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
      const preferred = acronymHits.filter((e) =>
        ACRONYM_PREFERENCES.has(normalize(e.title)),
      );
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
      const threshold = Math.min(
        4,
        Math.max(1, Math.floor(Math.max(q.length, t.length) * 0.25)),
      );
      if (dist <= threshold && dist < bestDist) {
        bestDist = dist;
        best = e;
      }
    }
    if (best) return best;
  }

  return null;
}

// Letar efter övningsnamn var som helst i en löpande text (t.ex. en
// journalanteckning skriven som prosa, inte en per-rad-lista) — istället
// för att kräva att hela raden bara är ett övningsnamn. Övningens titel
// måste förekomma som en sammanhängande ordföljd i texten (ordgränser, inte
// bara delsträng, så "curl" inte råkar träffa mitt i "curlpress"), och en
// eventuell sets×reps-uppgift precis efter (t.ex. "2x45 sekunder") plockas
// med som anteckning om den finns. Längre titlar prioriteras före kortare
// så att en mer specifik övning inte "äts upp" av en generell delträff, och
// varje ord i texten kan bara ingå i en enda träff.
function scanFreeTextForExercises(text: string, exercises: Exercise[]): SelectedRow[] {
  const rawTokens = text.split(/\s+/).filter(Boolean);
  const normTokens = rawTokens.map((t) => normalize(t));
  const consumed = new Array<boolean>(rawTokens.length).fill(false);
  const results: SelectedRow[] = [];

  const candidates = [...exercises].sort((a, b) => {
    const aLen = normalize(a.title).split(" ").filter(Boolean).length;
    const bLen = normalize(b.title).split(" ").filter(Boolean).length;
    return bLen - aLen;
  });

  for (const ex of candidates) {
    const needle = normalize(ex.title).split(" ").filter(Boolean);
    if (needle.length === 0) continue;
    // Ensamma korta ord (t.ex. "arm") ger för många falska träffar i fri
    // text — kräv antingen flera ord eller ett tillräckligt distinkt ord.
    if (needle.length === 1 && needle[0].length < 5) continue;

    for (let i = 0; i <= normTokens.length - needle.length; i++) {
      if (consumed[i]) continue;

      let ok = true;
      for (let j = 0; j < needle.length; j++) {
        if (consumed[i + j] || normTokens[i + j] !== needle[j]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      for (let j = 0; j < needle.length; j++) consumed[i + j] = true;

      const tailStr = rawTokens.slice(i + needle.length, i + needle.length + 8).join(" ");
      const repsMatch = tailStr.match(/\d+\s*[x×]\s*\d+/i);
      let notes = "";
      if (repsMatch && repsMatch.index != null) {
        // Bygger anteckningen av hela ord (inte teckenavklippning) — max två
        // ord efter själva NxM-delen, och stannar vid ett bindeord som
        // "och"/"samt" så nästa mening (t.ex. nästa övning) inte hänger med.
        const afterReps = tailStr.slice(repsMatch.index + repsMatch[0].length).trim();
        const stopWords = new Set(["och", "samt", "men", "sedan", "därefter"]);
        const keep: string[] = [];
        for (const w of afterReps.split(/\s+/).filter(Boolean)) {
          if (stopWords.has(normalize(w))) break;
          keep.push(w);
          if (keep.length >= 2) break;
        }
        notes = [repsMatch[0], ...keep].join(" ").trim();
      }

      results.push({
        rowId: crypto.randomUUID(),
        id: ex.id,
        title: ex.title,
        notes,
      });
    }
  }

  return results;
}

function parseExerciseNotes(text: string, exercises: Exercise[]) {
  const lines = text
    .split(/[\n,]+/)
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
      // Samma övning får gärna förekomma flera gånger (t.ex. omnämnd på
      // flera dagar i den inklistrade texten) — varje rad blir en egen
      // rad i programmet, inte en sammanslagning.
      matched.push({
        rowId: crypto.randomUUID(),
        id: ex.id,
        title: ex.title,
        notes: notePart,
      });
    } else {
      // Raden matchade inte som helhet (t.ex. en journalanteckning med
      // annan info blandat med övningarna) — sök igenom den löpande texten
      // istället för att ge upp direkt.
      const found = scanFreeTextForExercises(line, exercises);
      if (found.length > 0) {
        matched.push(...found);
      } else {
        unmatched.push(line);
      }
    }
  }

  return { matched, unmatched };
}

export default function ClinicProgramBuilder({
  exercises,
  action,
  initialLabel = "",
  initialSelected = [],
  submitLabel = "Skapa och kopiera länk →",
  submitPendingText = "Skapar...",
  customerPhone,
  customerName,
  customerEmail,
  initialNotesText = "",
  autoParseInitial = false,
}: {
  exercises: Exercise[];
  action: (formData: FormData) => void | Promise<void>;
  initialLabel?: string;
  initialSelected?: SelectedRow[];
  submitLabel?: string;
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  submitPendingText?: string;
  // Förifyller "Klistra in anteckningar"-fältet, t.ex. med en
  // journalanteckning eller markerad text därifrån (se kundens sida).
  initialNotesText?: string;
  // Kör "Tolka text" direkt vid montering istället för att kräva ett extra
  // klick — bara meningsfullt tillsammans med initialNotesText.
  autoParseInitial?: boolean;
}) {
  const formId = useId();
  const [label, setLabel] = useState(initialLabel);
  const [notesText, setNotesText] = useState(initialNotesText);
  const [selected, setSelected] = useState<SelectedRow[]>(() =>
    autoParseInitial && initialNotesText.trim()
      ? parseExerciseNotes(initialNotesText, exercises).matched
      : initialSelected,
  );
  const [unmatchedLines, setUnmatchedLines] = useState<string[]>(() =>
    autoParseInitial && initialNotesText.trim()
      ? parseExerciseNotes(initialNotesText, exercises).unmatched
      : [],
  );
  const [renderKey, setRenderKey] = useState(0);
  const [search, setSearch] = useState("");
  const [bodyFilter, setBodyFilter] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customVideoFile, setCustomVideoFile] = useState<File | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [customUploading, setCustomUploading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const customFileInputRef = useRef<HTMLInputElement>(null);

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
    .filter((e) => !bodyFilter || e.body_part === bodyFilter)
    .filter(
      (e) =>
        !search.trim() ||
        e.title.toLowerCase().includes(search.trim().toLowerCase()),
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  function parseNotes() {
    const { matched, unmatched } = parseExerciseNotes(notesText, exercises);
    setSelected(matched);
    setUnmatchedLines(unmatched);
    setRenderKey((k) => k + 1);
  }

  function add(ex: Exercise) {
    // Samma övning kan läggas till flera gånger med flit (t.ex. som både
    // uppvärmning och nedvarvning) — ingen dubblett-spärr här.
    setSelected((prev) => [
      ...prev,
      { rowId: crypto.randomUUID(), id: ex.id, title: ex.title, notes: "" },
    ]);
  }

  async function addCustom() {
    const title = customTitle.trim();
    if (!title || !customVideoFile) return;

    setCustomError(null);
    setCustomUploading(true);
    try {
      const { path, token, publicUrl } = await createClinicProgramVideoUploadUrl(
        customVideoFile.name,
        customVideoFile.size,
        customVideoFile.type,
      );
      const supabase = createClient();
      const { error } = await supabase.storage
        .from(CLINIC_PROGRAM_VIDEO_BUCKET)
        .uploadToSignedUrl(path, token, customVideoFile);
      if (error) throw error;

      setSelected((prev) => [
        ...prev,
        {
          rowId: crypto.randomUUID(),
          id: `custom-${crypto.randomUUID()}`,
          title,
          notes: customNote.trim(),
          isCustom: true,
          customVideoUrl: publicUrl,
        },
      ]);
      setCustomTitle("");
      setCustomVideoFile(null);
      if (customFileInputRef.current) customFileInputRef.current.value = "";
      setCustomNote("");
    } catch (err) {
      setCustomError(
        err instanceof Error ? err.message : "Något gick fel, försök igen.",
      );
    } finally {
      setCustomUploading(false);
    }
  }

  function remove(rowId: string) {
    setSelected((prev) => prev.filter((s) => s.rowId !== rowId));
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
        <h2>Namn/anteckning</h2>
        <input
          type="text"
          name="label"
          form={formId}
          placeholder="Namn/anteckning (t.ex. Anna K – vecka 1)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
          className={styles.textInput}
          style={{ width: "100%" }}
        />
      </div>

      <div className={styles.panel}>
        <h2>Klistra in anteckningar</h2>
        <textarea
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          placeholder={
            "Spidey crawls - 2x45 sekunder\nSitting knee squeezes - 2x10 upp till 50%"
          }
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
          <p
            className={styles.hint}
            style={{ color: "var(--warm)", marginTop: 12 }}
          >
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

      <form id={formId} action={action} className={styles.builder}>
        {customerPhone && <input type="hidden" name="customer_phone" value={customerPhone} />}
        {customerName && <input type="hidden" name="customer_name" value={customerName} />}
        {customerEmail && <input type="hidden" name="customer_email" value={customerEmail} />}
        <div className={styles.panel}>
          <h2>Kundens program ({selected.length})</h2>
          {selected.length === 0 ? (
            <p className={styles.hint}>
              Tolka en anteckningstext ovan, eller lägg till övningar för hand
              från listan nedan.
            </p>
          ) : (
            <ul className={styles.list}>
              {selected.map((row, i) => (
                <li key={`${renderKey}-${row.rowId}`} className={styles.row}>
                  <span className={styles.num}>{i + 1}</span>
                  <div className={styles.rowBody}>
                    <div className={styles.rowTitle}>
                      {row.title}
                      {row.isCustom && (
                        <span className={styles.customBadge}>Egen övning</span>
                      )}
                    </div>
                    <input
                      type="text"
                      name="notes"
                      defaultValue={row.notes}
                      placeholder={
                        row.isCustom ? "Kommentar" : "Sets/reps, t.ex. 2x12"
                      }
                      className={styles.searchInput}
                      style={{
                        marginTop: 4,
                        marginBottom: 0,
                        padding: "6px 10px",
                      }}
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
                      onClick={() => remove(row.rowId)}
                      aria-label="Ta bort"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="hidden"
                    name="exerciseIds"
                    value={row.isCustom ? "" : row.id}
                  />
                  <input
                    type="hidden"
                    name="customTitles"
                    value={row.isCustom ? row.title : ""}
                  />
                  <input
                    type="hidden"
                    name="customVideoUrls"
                    value={row.isCustom ? row.customVideoUrl ?? "" : ""}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.saveRow}>
          <SubmitButton
            className="btn btn-primary"
            pendingText={submitPendingText}
            disabled={selected.length === 0}
          >
            {submitLabel}
          </SubmitButton>
        </div>

        <details className={styles.panel}>
          <summary className={styles.panelSummary}>Alla övningar</summary>

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
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() => add(ex)}
                  >
                    + Lägg till
                  </button>
                </li>
              ))}
            </ul>
          )}
        </details>

        <details className={styles.panel}>
          <summary className={styles.panelSummary}>Lägg till egen övning</summary>
          <p className={styles.hint}>
            Inte i övningsbiblioteket, eller en variant anpassad för just den
            här kunden? Spela in eller ladda upp en video direkt här,
            tillsammans med en kort kommentar.
          </p>
          {customError && (
            <p style={{ color: "var(--warm)", fontSize: "0.88rem", marginBottom: 8 }}>
              {customError}
            </p>
          )}
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Namn på övningen"
            className={styles.textInput}
            style={{ width: "100%", marginBottom: 8 }}
          />

          <input
            type="file"
            accept="video/*"
            ref={customFileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setCustomError(null);
              setCustomVideoFile(f);
            }}
            style={{ marginBottom: 8, display: "block" }}
          />

          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Kommentar (valfritt)"
            className={styles.searchInput}
            style={{ marginBottom: 8 }}
          />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ border: "1px solid var(--line)" }}
            onClick={addCustom}
            disabled={!customTitle.trim() || !customVideoFile || customUploading}
          >
            {customUploading ? "Laddar upp..." : "+ Lägg till egen övning"}
          </button>
        </details>
      </form>
    </div>
  );
}
