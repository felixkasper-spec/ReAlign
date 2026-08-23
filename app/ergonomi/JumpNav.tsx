"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const jumps = [
  { id: "sitta", label: "Sitta" },
  { id: "sta", label: "Stå" },
  { id: "lyfta", label: "Lyfta" },
  { id: "sova", label: "Sova" },
  { id: "fler-vanor", label: "Fler vanor" },
  { id: "lyssna", label: "Lyssna" },
];

export default function JumpNav() {
  const [active, setActive] = useState("sitta");

  useEffect(() => {
    const sections = jumps
      .map((j) => document.getElementById(j.id))
      .filter((el): el is HTMLElement => !!el);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div className={styles.jumpnav}>
      {jumps.map((j) => (
        <a
          key={j.id}
          className={`${styles.jump} ${active === j.id ? styles.active : ""}`}
          href={`#${j.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(j.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          {j.label}
        </a>
      ))}
    </div>
  );
}
