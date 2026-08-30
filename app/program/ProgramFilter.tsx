"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { programMeta } from "@/lib/program-meta";

export type ProgramListItem = {
  id: string;
  slug: string;
  title: string;
  tier: string;
  hero_image: string | null;
  category: string;
  level: number | null;
};

type Filter = "all" | "free" | "premium";

export default function ProgramFilter({ programs }: { programs: ProgramListItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return programs;
    return programs.filter((p) => p.tier === filter);
  }, [programs, filter]);

  return (
    <>
      <div className={styles.tierFilter}>
        {(
          [
            ["all", "Alla"],
            ["free", "Gratis"],
            ["premium", "Premium"],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`${styles.tierFilterBtn} ${filter === key ? styles.tierFilterActive : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.grid} id="programlista">
        {filtered.map((p) => {
          const meta = programMeta[p.slug];
          return (
            <Link key={p.id} href={`/program/${p.slug}`} className={styles.card}>
              {p.hero_image && (
                <div className={`img-duo ${styles.cardThumb}`}>
                  <Image
                    src={p.hero_image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 880px) 100vw, 320px"
                  />
                </div>
              )}
              <div className={styles.cardTop}>
                <span className={styles.badge}>{meta?.level ?? ""}</span>
                <span
                  className={`${styles.badge} ${
                    p.tier === "premium" ? styles.premium : styles.free
                  }`}
                >
                  {p.tier === "premium" ? "Premium" : "Gratis"}
                </span>
              </div>
              <h3>{p.title}</h3>
              <p className={styles.purpose}>{meta?.purpose}</p>
              <div className={styles.stats}>
                <span>{meta?.weeks}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
