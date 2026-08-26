import type { WeekCount } from "@/lib/progression";
import styles from "./WeeklyTrendChart.module.css";

const MAX_BAR_HEIGHT = 64;

export default function WeeklyTrendChart({ weeks }: { weeks: WeekCount[] }) {
  const maxCount = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <div className={styles.chart}>
      {weeks.map((w) => {
        const start = new Date(w.weekStart);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 6);
        const label = start.toLocaleDateString("sv-SE", { day: "numeric", month: "numeric" });
        const range = `${start.toLocaleDateString("sv-SE")} – ${end.toLocaleDateString("sv-SE")}`;
        const height =
          w.count === 0 ? 3 : Math.max(6, Math.round((w.count / maxCount) * MAX_BAR_HEIGHT));

        return (
          <div className={styles.col} key={w.weekStart}>
            <div className={styles.barTrack}>
              <div
                className={`${styles.bar} ${w.count === 0 ? styles.barEmpty : ""}`}
                style={{ height }}
                title={`${w.count} pass, ${range}`}
              />
            </div>
            <span className={styles.label}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
