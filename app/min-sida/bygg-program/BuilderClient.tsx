"use client";

import { useMemo, useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createCustomProgram } from "../custom-program-actions";
import styles from "./page.module.css";

type Exercise = { id: string; slug: string; title: string; body_part: string };

export default function BuilderClient({
  exercises,
  favoriteIds,
}: {
  exercises: Exercise[];
  favoriteIds: string[];
}) {
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [bodyFilter, setBodyFilter] = useState<string>("");

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const selectedSet = useMemo(() => new Set(selected.map((e) => e.id)), [selected]);

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
    .sort((a, b) => {
      const favA = favoriteSet.has(a.id) ? 0 : 1;
      const favB = favoriteSet.has(b.id) ? 0 : 1;
      return favA - favB || a.title.localeCompare(b.title);
    });

  function add(ex: Exercise) {
    setSelected((prev) => [...prev, ex]);
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((e) => e.id !== id));
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
    <form action={createCustomProgram} className={styles.builder}>
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
                    <div className={styles.rowTitle}>
                      {favoriteSet.has(ex.id) && <span className={styles.favMark}>♥</span>}
                      {ex.title}
                    </div>
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
          <h2>Mitt program ({selected.length})</h2>
          {selected.length === 0 ? (
            <p className={styles.hint}>Lägg till övningar från listan till vänster.</p>
          ) : (
            <ul className={styles.list}>
              {selected.map((ex, i) => (
                <li key={ex.id} className={styles.row}>
                  <span className={styles.num}>{i + 1}</span>
                  <div className={styles.rowBody}>
                    <div className={styles.rowTitle}>{ex.title}</div>
                    <div className={styles.rowMeta}>{ex.body_part}</div>
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
                      onClick={() => remove(ex.id)}
                      aria-label="Ta bort"
                    >
                      ✕
                    </button>
                  </div>
                  <input type="hidden" name="exerciseIds" value={ex.id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.saveRow}>
        <input
          type="text"
          name="title"
          placeholder="Namn på ditt program..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.textInput}
        />
        <SubmitButton
          className="btn btn-primary"
          pendingText="Sparar..."
          disabled={selected.length === 0}
        >
          Spara program →
        </SubmitButton>
      </div>
    </form>
  );
}
