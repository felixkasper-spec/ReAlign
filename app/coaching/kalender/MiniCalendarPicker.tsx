"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isoWeekday, dateStr } from "@/lib/booking-slots";
import type { StaffFilter } from "./CalendarGrid";
import styles from "./admin-shell.module.css";

const WEEKDAY_HEADERS = ["M", "T", "O", "T", "F", "L", "S"];
const MONTH_LABELS = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

function addMonths(date: Date, n: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1));
}

export default function MiniCalendarPicker({
  selectedDate,
  staff,
  view,
  onClose,
}: {
  selectedDate: Date;
  staff: StaffFilter;
  view: "week" | "day";
  onClose: () => void;
}) {
  const router = useRouter();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1)),
  );

  const firstWeekday = isoWeekday(visibleMonth);
  const daysInMonth = new Date(
    Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth() + 1, 0),
  ).getUTCDate();

  const cells: (Date | null)[] = [];
  for (let i = 1; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(Date.UTC(visibleMonth.getUTCFullYear(), visibleMonth.getUTCMonth(), d)));
  }

  function pickDate(d: Date) {
    router.push(`/coaching/kalender?staff=${staff}&view=${view}&date=${dateStr(d)}`);
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.miniCalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.miniCalHead}>
          <button type="button" onClick={() => setVisibleMonth((m) => addMonths(m, -1))} aria-label="Föregående månad">
            ←
          </button>
          <span>
            {MONTH_LABELS[visibleMonth.getUTCMonth()]} {visibleMonth.getUTCFullYear()}
          </span>
          <button type="button" onClick={() => setVisibleMonth((m) => addMonths(m, 1))} aria-label="Nästa månad">
            →
          </button>
        </div>
        <div className={styles.miniCalGrid}>
          {WEEKDAY_HEADERS.map((w, i) => (
            <div key={i} className={styles.miniCalWeekday}>
              {w}
            </div>
          ))}
          {cells.map((d, i) => (
            <button
              key={i}
              type="button"
              disabled={!d}
              className={styles.miniCalDay}
              data-selected={d && dateStr(d) === dateStr(selectedDate) ? "" : undefined}
              onClick={() => d && pickDate(d)}
            >
              {d ? d.getUTCDate() : ""}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
