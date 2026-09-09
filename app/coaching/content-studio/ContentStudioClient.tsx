"use client";

import { useEffect, useState } from "react";
import styles from "../../min-sida/bygg-program/page.module.css";

type Exercise = {
  id: string;
  slug: string;
  title: string;
  body_part: string;
  sets_reps: string | null;
  instructions: string | null;
};

const FORMATS = [
  { key: "portrait" as const, label: "Stående (1080×1350)" },
  { key: "square" as const, label: "Kvadrat (1080×1080)" },
];

function firstParagraph(text: string | null, maxLen = 150) {
  if (!text) return "";
  const para = text.split("\n\n")[0].replace(/^- /, "").trim();
  return para.length > maxLen ? `${para.slice(0, maxLen).trim()}…` : para;
}

export default function ContentStudioClient({ exercises }: { exercises: Exercise[] }) {
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<"portrait" | "square">("portrait");
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("Välj en övning till vänster");
  const [caption, setCaption] = useState("");
  const [previewQuery, setPreviewQuery] = useState("");

  // Debounce — annars skickas en ny bildgenerering vid varje tangenttryck.
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams({ title, format });
      if (eyebrow) params.set("eyebrow", eyebrow);
      if (caption) params.set("caption", caption);
      setPreviewQuery(params.toString());
    }, 350);
    return () => clearTimeout(t);
  }, [title, eyebrow, caption, format]);

  const filtered = exercises
    .filter((e) => !search.trim() || e.title.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 40);

  function selectExercise(ex: Exercise) {
    setEyebrow(ex.body_part.toUpperCase());
    setTitle(ex.title);
    const tip = firstParagraph(ex.instructions);
    setCaption(ex.sets_reps ? `${tip}${tip ? " " : ""}(${ex.sets_reps})` : tip);
  }

  const previewSrc = `/api/social-image?${previewQuery}`;
  const aspectRatio = format === "portrait" ? "1080 / 1350" : "1080 / 1080";

  return (
    <div className={styles.builder}>
      <div className={styles.cols}>
        <div className={styles.panel}>
          <h2>Välj övning</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sök övning..."
            className={styles.searchInput}
          />
          {filtered.length === 0 ? (
            <p className={styles.hint}>Inga övningar matchade.</p>
          ) : (
            <ul className={styles.list}>
              {filtered.map((ex) => (
                <li key={ex.id} className={styles.row}>
                  <div>
                    <div className={styles.rowTitle}>{ex.title}</div>
                    <div className={styles.rowMeta}>{ex.body_part}</div>
                  </div>
                  <button type="button" className={styles.addBtn} onClick={() => selectExercise(ex)}>
                    Välj
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.panel}>
          <h2>Bild</h2>

          <div className={styles.filterRow}>
            {FORMATS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`${styles.filterChip} ${format === f.key ? styles.filterChipActive : ""}`}
                onClick={() => setFormat(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <label
              style={{ display: "block", fontSize: "0.82rem", color: "var(--text-soft)", marginBottom: 4 }}
            >
              Kategori (liten text överst)
            </label>
            <input
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              className={styles.searchInput}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <label
              style={{ display: "block", fontSize: "0.82rem", color: "var(--text-soft)", marginBottom: 4 }}
            >
              Rubrik
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.searchInput}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <label
              style={{ display: "block", fontSize: "0.82rem", color: "var(--text-soft)", marginBottom: 4 }}
            >
              Text/tips
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className={styles.searchInput}
              style={{ resize: "vertical", marginBottom: 0, fontFamily: "inherit" }}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              maxWidth: 320,
              aspectRatio,
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid var(--line)",
              background: "var(--surface)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Förhandsvisning"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          <a
            href={previewSrc}
            download={`${title.toLowerCase().replace(/\s+/g, "-") || "realign"}.png`}
            className="btn btn-primary"
            style={{ display: "inline-block", marginTop: 16 }}
          >
            Ladda ner PNG →
          </a>
        </div>
      </div>
    </div>
  );
}
