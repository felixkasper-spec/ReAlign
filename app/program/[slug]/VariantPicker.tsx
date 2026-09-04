"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { hasThumbnail } from "@/app/ovningsbank/thumbnails";
import styles from "./page.module.css";

export type VariantExercise = {
  slug: string;
  title: string;
  body_part: string;
};

const variantLabels: Record<string, { title: string; sub: string }> = {
  full: { title: "Fullt program", sub: "övningar" },
  mellan: { title: "Mellan", sub: "övningar" },
  kort: { title: "Kort", sub: "övningar" },
};

export default function VariantPicker({
  variants,
  defaultVariant,
  programSlug,
}: {
  variants: Record<string, VariantExercise[]>;
  defaultVariant: string;
  programSlug: string;
}) {
  const keys = ["full", "mellan", "kort"].filter((k) => variants[k]);
  const [active, setActive] = useState(
    keys.includes(defaultVariant) ? defaultVariant : "full",
  );
  const exercises = variants[active] ?? [];

  return (
    <div>
      {keys.length > 1 && (
        <div className={styles.lengthPicker}>
          <span className="eyebrow">Har du ont om tid?</span>
          <div className={styles.lengthOptions}>
            {keys.map((key) => (
              <button
                key={key}
                type="button"
                className={`${styles.lengthOpt} ${active === key ? styles.current : ""}`}
                onClick={() => setActive(key)}
              >
                <b>{variantLabels[key]?.title ?? key}</b>
                <span>
                  {variants[key].length} {variantLabels[key]?.sub ?? "övningar"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={styles.exHint}>🎥 Klicka på en övning för video- och textinstruktioner</p>
      <div className={styles.exListHead}>
        <h2>Övningar i programmet</h2>
        <span>{exercises.length} st, i ordning</span>
      </div>
      <div>
        {exercises.map((ex, i) => (
          <Link
            key={ex.slug}
            href={`/ovningsbank/${ex.slug}?program=${programSlug}&variant=${active}`}
            className={styles.exRow}
          >
            <span className={styles.exNum}>{i + 1}</span>
            {hasThumbnail(ex.slug) && (
              <span className={styles.exThumb}>
                <Image src={`/exercises/${ex.slug}.jpg`} alt="" fill sizes="52px" />
                <span className={styles.playIcon} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="white">
                    <path d="M3 1.5v11l9-5.5-9-5.5z" />
                  </svg>
                </span>
              </span>
            )}
            <span className={styles.exInfo}>
              <h3>{ex.title}</h3>
            </span>
            <span className={styles.exArrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
