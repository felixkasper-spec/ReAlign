"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { hasThumbnail } from "@/app/ovningsbank/thumbnails";
import type { ClinicPlayerExercise } from "@/lib/clinic-program";
import listStyles from "../../program/[slug]/page.module.css";
import exStyles from "../../ovningsbank/[slug]/page.module.css";

function renderInstructions(text: string) {
  return text.split("\n\n").map((block, i) => {
    const lines = block.split("\n").filter(Boolean);
    const isBulletList = lines.every((l) => l.startsWith("- "));
    if (isBulletList) {
      return (
        <ul className={exStyles.bulletList} key={i}>
          {lines.map((line, j) => (
            <li className={exStyles.bulletItem} key={j}>
              <span className={exStyles.dot2} />
              {line.replace(/^- /, "")}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{block}</p>;
  });
}

export default function ClinicExerciseRow({
  exercise,
  index,
  playerHref,
}: {
  exercise: ClinicPlayerExercise;
  index: number;
  playerHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Link href={playerHref} className={listStyles.exRow}>
        <span className={listStyles.exNum}>{index + 1}</span>
        {hasThumbnail(exercise.slug) && (
          <span className={listStyles.exThumb}>
            <Image src={`/exercises/${exercise.slug}.jpg`} alt="" fill sizes="52px" />
            <span className={listStyles.playIcon} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="white">
                <path d="M3 1.5v11l9-5.5-9-5.5z" />
              </svg>
            </span>
          </span>
        )}
        <span className={listStyles.exInfo}>
          <h3>{exercise.title}</h3>
          {exercise.setsReps && (
            <span style={{ fontSize: "0.82rem", color: "var(--text-soft)" }}>
              {exercise.setsReps}
            </span>
          )}
        </span>
        <span className={listStyles.exArrow}>→</span>
      </Link>

      {exercise.instructions && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: "0 0 14px 34px",
              color: "var(--sage)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {open ? "Dölj textinstruktioner ▴" : "Textinstruktioner ▾"}
          </button>
          {open && (
            <div className={exStyles.exSection} style={{ padding: "0 0 14px 34px" }}>
              {renderInstructions(exercise.instructions)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
