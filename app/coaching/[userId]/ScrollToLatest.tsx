"use client";

import { useEffect, useRef } from "react";
import styles from "../page.module.css";

// Tråden visar äldsta meddelandet först (naturlig läsordning), men coachen
// ska mötas av det senaste när de öppnar den — scrollar dit direkt vid
// inladdning istället för att byta renderingsordning. scroll-margin-bottom
// på ankaret gör att webbläsaren automatiskt lämnar plats för det fasta
// svarsfältet, så senaste meddelandet inte hamnar dolt bakom det.
export default function ScrollToLatest() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "end", behavior: "instant" });
  }, []);

  return <div ref={ref} className={styles.threadEndAnchor} />;
}
