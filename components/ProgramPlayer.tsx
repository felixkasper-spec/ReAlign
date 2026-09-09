"use client";

import { useState } from "react";
import Link from "next/link";
import VimeoEmbed from "./VimeoEmbed";
import GuestAccountPrompt from "./GuestAccountPrompt";
import SubmitButton from "./SubmitButton";
import type { PlayerExercise } from "@/lib/player-data";
import styles from "./ProgramPlayer.module.css";

function renderInstructions(text: string) {
  return text.split("\n\n").map((block, i) => {
    const lines = block.split("\n").filter(Boolean);
    const isBulletList = lines.every((l) => l.startsWith("- "));
    if (isBulletList) {
      return (
        <ul className={styles.bulletList} key={i}>
          {lines.map((line, j) => (
            <li className={styles.bulletItem} key={j}>
              <span className={styles.dot2} />
              {line.replace(/^- /, "")}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{block}</p>;
  });
}

export default function ProgramPlayer({
  exercises,
  programTitle,
  backHref,
  loggedIn,
  completeAction,
  initialIndex = 0,
  signupHref,
}: {
  exercises: PlayerExercise[];
  programTitle: string;
  backHref: string;
  loggedIn: boolean;
  completeAction?: (formData: FormData) => void | Promise<void>;
  initialIndex?: number;
  signupHref?: string;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [done, setDone] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const current = exercises[index];
  // blurb ovanför är redan första stycket av instructions — dropdownen ska
  // fortsätta därifrån, inte upprepa det.
  const restOfInstructions = current?.instructions
    ? current.instructions.split("\n\n").slice(1).join("\n\n") || null
    : null;

  // Textinstruktioner ska stängas igen när man går vidare till nästa
  // övning — justerar state under render (React-dokumenterat mönster)
  // istället för en useEffect, så det inte blir en extra renderpass.
  const [lastIndex, setLastIndex] = useState(index);
  if (index !== lastIndex) {
    setLastIndex(index);
    setInstructionsOpen(false);
  }

  if (!current && !done) return null;

  const isLast = index === exercises.length - 1;

  function goNext() {
    if (isLast) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function goPrev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  if (done) {
    return (
      <div className={styles.wrap}>
        <div className={styles.doneBox}>
          <span className={styles.doneEmoji}>🎉</span>
          <h1>Bra jobbat!</h1>
          <p>Du klarade hela {programTitle}.</p>
          {loggedIn && completeAction ? (
            <form action={completeAction}>
              <SubmitButton className="btn btn-primary" pendingText="Loggar...">
                ✓ Markera som klar
              </SubmitButton>
            </form>
          ) : (
            <GuestAccountPrompt href={signupHref} />
          )}
          <Link href={backHref} className={styles.backLink}>
            ← Tillbaka till programmet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <Link href={backHref} className={styles.exitLink}>
          ← Tillbaka till programöversikt
        </Link>
        <div className={styles.dots}>
          {exercises.map((ex, i) => (
            <span
              key={ex.slug}
              className={`${styles.dot} ${i <= index ? styles.dotFilled : ""}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.videoWrap}>
        {current.videoUrl && (
          <VimeoEmbed
            key={current.slug}
            src={current.videoUrl}
            className={styles.video}
            poster={current.thumbnailUrl}
            aspectRatio={current.aspectRatio}
            autoplay
          />
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.counter}>
          Övning {index + 1} av {exercises.length}
        </span>
        <h1 className={styles.title}>{current.title}</h1>
        {current.setsReps && <div className={styles.statPill}>{current.setsReps}</div>}
        {current.blurb && <p className={styles.blurb}>{current.blurb}</p>}
        {restOfInstructions && (
          <>
            <button
              type="button"
              className={styles.instructionsToggle}
              onClick={() => setInstructionsOpen((v) => !v)}
            >
              {instructionsOpen ? "Dölj textinstruktioner ▴" : "Textinstruktioner ▾"}
            </button>
            {instructionsOpen && (
              <div className={styles.instructionsBlock}>
                {renderInstructions(restOfInstructions)}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.prevBtn}
            onClick={goPrev}
            disabled={index === 0}
          >
            ← Föregående
          </button>
          <button type="button" className={styles.nextBtn} onClick={goNext}>
            {isLast ? "Slutför pass →" : "Nästa övning →"}
          </button>
        </div>
      </div>
    </div>
  );
}
