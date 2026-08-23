"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Picker.module.css";

function generateTimes() {
  const times: string[] = [];
  for (let h = 5; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return times;
}

const TIMES = generateTimes();

export default function TimePicker({
  name,
  required,
}: {
  name: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.icon}>🕐</span>
        {selected || "Välj tid"}
      </button>
      <input type="hidden" name={name} value={selected} required={required} />
      {open && (
        <div className={`${styles.panel} ${styles.timePanel}`}>
          {TIMES.map((t) => (
            <button
              type="button"
              key={t}
              className={`${styles.timeOpt} ${selected === t ? styles.selected : ""}`}
              onClick={() => {
                setSelected(t);
                setOpen(false);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
