"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./LockedContentNudge.module.css";

const COUNT_KEY = "realign_locked_views";
const DISMISSED_KEY = "realign_locked_nudge_dismissed_at";
const THRESHOLD = 3;

// Räknar hur många låsta program/övningar besökaren tittat på (i den här
// webbläsaren) och visar en påminnelse efter ett par tittar, istället för
// den statiska "Bli Premium"-rutan som alltid syns oavsett hur intresserad
// man verkar vara. Ingen backend — bara ett tecken på återkommande
// intresse, inget som behöver vara exakt eller synkas mellan enheter.
export default function LockedContentNudge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // queueMicrotask: localStorage finns bara i webbläsaren, så värdet kan
    // först vara känt efter mount — en riktig extern källa vi synkar från,
    // inte state vi kunde räknat ut direkt under rendering. Mikrotasken gör
    // uppdateringen asynkron i förhållande till själva effect-kroppen.
    queueMicrotask(() => {
      try {
        const count = Number(localStorage.getItem(COUNT_KEY) ?? "0") + 1;
        localStorage.setItem(COUNT_KEY, String(count));

        const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? "0");
        if (count >= THRESHOLD && count >= dismissedAt + THRESHOLD) {
          setShow(true);
        }
      } catch {
        // Privat läge eller blockerad storage — visa bara inte påminnelsen.
      }
    });
  }, []);

  function dismiss() {
    try {
      const count = Number(localStorage.getItem(COUNT_KEY) ?? "0");
      localStorage.setItem(DISMISSED_KEY, String(count));
    } catch {
      // no-op
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className={styles.nudge}>
      <span className={styles.text}>
        Du har kollat på flera låsta program/övningar — Premium låser upp allt.
      </span>
      <div className={styles.actions}>
        <Link href="/premium" className={styles.link}>
          Se vad som ingår →
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className={styles.dismiss}
          aria-label="Stäng"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
