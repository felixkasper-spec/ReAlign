"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

// En pil i innehållsflödet kan hamna under skärmkanten i inbäddade
// webbläsare med mindre synlig yta (t.ex. Facebook/Instagram-appens egen
// webbvy). Den här är istället fast förankrad mot skärmens nederkant, så
// den syns garanterat oavsett hur högt hero-innehållet blir — och
// försvinner så fort besökaren börjar scrolla.
export default function ScrollHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY < 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <a
      href="#steps"
      className={styles.scrollHint}
      aria-label="Scrolla ner för att läsa mer"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 6l5 5 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
