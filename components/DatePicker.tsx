"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Picker.module.css";

const WEEKDAYS = ["M", "T", "O", "T", "F", "L", "S"];
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function DatePicker({
  name,
  required,
}: {
  name: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
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

  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
  ).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.icon}>📅</span>
        {selected
          ? selected.toLocaleDateString("sv-SE", {
              day: "numeric",
              month: "short",
            })
          : "Välj datum"}
      </button>
      <input type="hidden" name={name} value={selected ? toKey(selected) : ""} required={required} />
      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
                )
              }
              aria-label="Föregående månad"
            >
              ‹
            </button>
            <span>
              {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() =>
                setViewMonth(
                  (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
                )
              }
              aria-label="Nästa månad"
            >
              ›
            </button>
          </div>
          <div className={styles.weekdays}>
            {WEEKDAYS.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
          <div className={styles.grid}>
            {cells.map((d, i) =>
              d ? (
                <button
                  type="button"
                  key={i}
                  className={`${styles.day} ${
                    selected && toKey(selected) === toKey(d) ? styles.selected : ""
                  } ${toKey(d) === toKey(today) ? styles.today : ""}`}
                  onClick={() => {
                    setSelected(d);
                    setOpen(false);
                  }}
                >
                  {d.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
