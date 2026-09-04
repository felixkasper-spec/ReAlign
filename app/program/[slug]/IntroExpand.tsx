"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function IntroExpand({ paragraphs }: { paragraphs: string[] }) {
  const [open, setOpen] = useState(false);
  const [first, ...rest] = paragraphs;

  return (
    <div className={styles.progIntro}>
      <p>{first}</p>
      {open && rest.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      {rest.length > 0 && (
        <button
          type="button"
          className={styles.introToggle}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Visa mindre ▴" : "Visa mer ▾"}
        </button>
      )}
    </div>
  );
}
