"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VimeoEmbed from "./VimeoEmbed";
import GuestAccountPrompt from "./GuestAccountPrompt";
import SubmitButton from "./SubmitButton";
import type { PlayerExercise } from "@/lib/player-data";
import styles from "./ProgramPlayer.module.css";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProgramPlayer({
  exercises,
  programTitle,
  backHref,
  loggedIn,
  completeAction,
}: {
  exercises: PlayerExercise[];
  programTitle: string;
  backHref: string;
  loggedIn: boolean;
  completeAction: (formData: FormData) => void | Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const current = exercises[index];
  const [secondsLeft, setSecondsLeft] = useState(current?.durationSeconds ?? 0);

  // Nollställer timern när övningen byts — görs under rendering (inte i en
  // effekt) enligt Reacts rekommenderade mönster för att "återställa state
  // när en prop ändras", så vi slipper en extra commit-cykel bara för
  // återställningen.
  const [timerForIndex, setTimerForIndex] = useState(index);
  if (index !== timerForIndex) {
    setTimerForIndex(index);
    setSecondsLeft(exercises[index]?.durationSeconds ?? 0);
  }

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  if (!current && !done) return null;

  const ready = secondsLeft <= 0;
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
          {loggedIn ? (
            <form action={completeAction}>
              <SubmitButton className="btn btn-primary" pendingText="Loggar...">
                ✓ Markera som klar
              </SubmitButton>
            </form>
          ) : (
            <GuestAccountPrompt />
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
          ← Avsluta pass
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
      </div>

      <div className={styles.controls}>
        <span className={styles.timer}>{formatTime(secondsLeft)}</span>
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.prevBtn}
            onClick={goPrev}
            disabled={index === 0}
          >
            ← Föregående
          </button>
          <button
            type="button"
            className={`${styles.nextBtn} ${ready ? styles.nextBtnReady : ""}`}
            onClick={goNext}
          >
            {isLast ? "Slutför pass →" : "Nästa övning →"}
          </button>
        </div>
      </div>
    </div>
  );
}
