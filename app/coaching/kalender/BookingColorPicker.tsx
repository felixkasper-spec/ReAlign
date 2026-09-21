"use client";

import { BOOKING_COLORS } from "@/lib/booking-colors";
import styles from "./admin-shell.module.css";

export default function BookingColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className={styles.colorPicker}>
      {BOOKING_COLORS.map((c) => (
        <button
          key={c.hex}
          type="button"
          className={styles.colorSwatch}
          style={{ background: c.hex }}
          data-selected={value === c.hex || undefined}
          aria-label={c.label}
          title={c.label}
          onClick={() => onChange(c.hex)}
        />
      ))}
    </div>
  );
}
