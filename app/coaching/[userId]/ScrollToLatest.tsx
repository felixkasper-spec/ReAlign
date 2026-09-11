"use client";

import { useEffect, useRef } from "react";

// Tråden visar äldsta meddelandet först (naturlig läsordning), men coachen
// ska mötas av det senaste när de öppnar den — scrollar dit direkt vid
// inladdning inom chattrutans egen scroll-yta (.cardScroll), inte hela
// sidan, så resten av sidan (och footern) inte rör sig.
export default function ScrollToLatest() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "end", behavior: "instant" });
  }, []);

  return <div ref={ref} />;
}
