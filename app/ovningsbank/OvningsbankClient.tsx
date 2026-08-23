"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import styles from "./page.module.css";
import { hasThumbnail } from "./thumbnails";

export type ExerciseListItem = {
  id: string;
  slug: string;
  title: string;
  categories: string[];
  equipment: string | null;
  sets_reps: string | null;
};

export default function OvningsbankClient({
  exercises,
  favoriteIds,
  loggedIn,
}: {
  exercises: ExerciseListItem[];
  favoriteIds: string[];
  loggedIn: boolean;
}) {
  const [search, setSearch] = useState("");
  const [bodyFilter, setBodyFilter] = useState<string[]>([]);
  const [equipFilter, setEquipFilter] = useState<string[]>([]);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const bodyParts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of exercises) {
      for (const category of e.categories) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    }
    return [...counts.entries()];
  }, [exercises]);

  const equipmentOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of exercises) {
      if (e.equipment) counts.set(e.equipment, (counts.get(e.equipment) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [exercises]);

  function toggle(list: string[], value: string, setList: (v: string[]) => void) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  const filtered = exercises.filter((e) => {
    if (bodyFilter.length > 0 && !e.categories.some((c) => bodyFilter.includes(c)))
      return false;
    if (equipFilter.length > 0 && (!e.equipment || !equipFilter.includes(e.equipment)))
      return false;
    if (search.trim() && !e.title.toLowerCase().includes(search.trim().toLowerCase()))
      return false;
    return true;
  });

  return (
    <>
      <div className={styles.searchbar}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök övning"
          className={styles.searchInput}
        />
      </div>

      <div className={styles.layout}>
        <aside className={styles.filters}>
          <div className={styles.filterGroup}>
            <div className={styles.filterTitle}>Kroppsdel</div>
            {bodyParts.map(([value, count]) => (
              <label className={styles.filterOpt} key={value}>
                <input
                  type="checkbox"
                  checked={bodyFilter.includes(value)}
                  onChange={() => toggle(bodyFilter, value, setBodyFilter)}
                />
                {value === "Bål" ? "Mage" : value}
                <span className={styles.count}>{count}</span>
              </label>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <div className={styles.filterTitle}>Utrustning</div>
            {equipmentOptions.map(([value]) => (
              <label className={styles.filterOpt} key={value}>
                <input
                  type="checkbox"
                  checked={equipFilter.includes(value)}
                  onChange={() => toggle(equipFilter, value, setEquipFilter)}
                />
                {value}
              </label>
            ))}
          </div>
        </aside>

        <main>
          <div className={styles.resultsBar}>
            <span>
              {filtered.length === exercises.length
                ? "Visar alla övningar"
                : `${filtered.length} av ${exercises.length} övningar`}
            </span>
            {(bodyFilter.length > 0 || equipFilter.length > 0 || search) && (
              <button
                type="button"
                className={styles.clearFilters}
                onClick={() => {
                  setBodyFilter([]);
                  setEquipFilter([]);
                  setSearch("");
                }}
              >
                Rensa filter
              </button>
            )}
          </div>

          {filtered.length === 0 && (
            <p className={styles.empty}>Inga övningar matchar filtret.</p>
          )}

          <div className={styles.grid} id="ovningslista">
            {filtered.map((exercise) => (
              <div key={exercise.id} className={styles.card}>
                <Link href={`/ovningsbank/${exercise.slug}`} className={styles.cardTop}>
                  {hasThumbnail(exercise.slug) && (
                    <div className={`img-duo ${styles.cardThumb}`}>
                      <Image
                        src={`/exercises/${exercise.slug}.jpg`}
                        alt={exercise.title}
                        fill
                        sizes="(max-width: 880px) 100vw, 320px"
                      />
                    </div>
                  )}
                  <h3>{exercise.title}</h3>
                  <div className={styles.tags}>
                    {exercise.equipment && (
                      <span className="tag">{exercise.equipment}</span>
                    )}
                    {exercise.sets_reps && (
                      <span className="tag">{exercise.sets_reps.split(" · ")[0]}</span>
                    )}
                  </div>
                </Link>
                <FavoriteButton
                  exerciseId={exercise.id}
                  initialFavorited={favoriteSet.has(exercise.id)}
                  loggedIn={loggedIn}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
