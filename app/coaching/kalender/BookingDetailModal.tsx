"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { normalizePhone } from "@/lib/customer-identity";
import { DEFAULT_BOOKING_COLOR } from "@/lib/booking-colors";
import { updateBooking, cancelBooking } from "./actions";
import BookingColorPicker from "./BookingColorPicker";
import type { Service } from "./QuickBookingModal";
import styles from "./admin-shell.module.css";

export type BookingDetail = {
  id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  serviceName: string;
  staff: string;
  price_sek: number | null;
  color: string | null;
  notes: string | null;
};

// "Siffra = siffra"-konvention (se lib/booking-slots.ts) — start_at/end_at
// är redan lagrade som lokala klocktider utan tidszonsomräkning, så vi
// klipper bara isär ISO-strängen i datum- och tidsdel.
function toDatePart(iso: string): string {
  return iso.slice(0, 10);
}
function toTimePart(iso: string): string {
  return iso.slice(11, 16);
}

export default function BookingDetailModal({
  booking,
  services,
  onClose,
}: {
  booking: BookingDetail;
  services: Service[];
  onClose: () => void;
}) {
  const [serviceId, setServiceId] = useState(booking.service_id);
  const [date, setDate] = useState(toDatePart(booking.start_at));
  const [startTime, setStartTime] = useState(toTimePart(booking.start_at));
  const [endTime, setEndTime] = useState(toTimePart(booking.end_at));
  const [price, setPrice] = useState(
    booking.price_sek != null
      ? String(booking.price_sek)
      : String(services.find((s) => s.id === booking.service_id)?.price_sek ?? 0),
  );
  const [color, setColor] = useState(booking.color ?? DEFAULT_BOOKING_COLOR);
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateBooking(
        booking.id,
        booking.staff,
        serviceId,
        `${date}T${startTime}:00Z`,
        `${date}T${endTime}:00Z`,
        price,
        color,
        notes,
      );
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      onClose();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelBooking(booking.id);
      onClose();
    });
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2>Bokning</h2>
          <button type="button" onClick={onClose} aria-label="Stäng">
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 14, fontSize: "0.9rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontWeight: 600 }}>{booking.customer_name}</span>
            <Link
              href={`/coaching/kunder/${normalizePhone(booking.customer_phone)}`}
              className="btn btn-ghost"
              style={{ border: "1px solid var(--line)", padding: "4px 10px", fontSize: "0.78rem" }}
            >
              Öppna journal →
            </Link>
          </div>
          <div style={{ color: "var(--text-soft)" }}>{booking.customer_phone}</div>
          {booking.customer_email && (
            <div style={{ color: "var(--text-soft)" }}>{booking.customer_email}</div>
          )}
        </div>

        <form onSubmit={handleSave} className={styles.modalForm}>
          {error && <p style={{ color: "var(--warm)", fontSize: "0.85rem" }}>{error}</p>}

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-soft)" }}>
            Tjänst
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration_minutes} min)
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-soft)" }}>
            Datum
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-soft)", flex: 1 }}>
              Starttid
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-soft)", flex: 1 }}>
              Sluttid
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </label>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-soft)" }}>
            Pris (kr)
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.8rem", color: "var(--text-soft)" }}>
            Färg
            <BookingColorPicker value={color} onChange={setColor} />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-soft)" }}>
            Notering (bara synlig för er)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{
                font: "inherit",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                resize: "vertical",
              }}
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Sparar..." : "Spara ändring"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={styles.smallGhostBtn}
            disabled={pending}
            style={{ alignSelf: "center" }}
          >
            Avboka
          </button>
        </form>
      </div>
    </div>
  );
}
