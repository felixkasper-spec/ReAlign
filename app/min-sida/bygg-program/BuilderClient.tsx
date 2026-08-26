"use client";

import { useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createCustomProgram } from "../custom-program-actions";
import styles from "./page.module.css";

type FavExercise = { id: string; slug: string; title: string; body_part: string };

export default function BuilderClient({ favorites }: { favorites: FavExercise[] }) {
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<FavExercise[]>([]);

  const available = favorites.filter((f) => !selected.some((s) => s.id === f.id));

  function add(ex: FavExercise) {
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
          <h2>Dina favoritövningar</h2>
          {available.length === 0 ? (
            <p className={styles.hint}>Alla dina favoriter är tillagda.</p>
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
