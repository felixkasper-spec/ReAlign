"use client";

import { useRef, useState, useTransition } from "react";
import type { LeadOwner } from "@/lib/lead-owner";
import { DEFAULT_BOOKING_COLOR } from "@/lib/booking-colors";
import {
  createBookingAsStaff,
  createCustomerFromCalendar,
  searchCustomers,
  type CustomerMatch,
} from "./actions";
import BookingColorPicker from "./BookingColorPicker";
import styles from "./admin-shell.module.css";

export type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_sek: number;
};

export default function QuickBookingModal({
  startAt,
  staff,
  services,
  onClose,
}: {
  startAt: Date;
  staff: LeadOwner;
  services: Service[];
  onClose: () => void;
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [price, setPrice] = useState(String(services[0]?.price_sek ?? 0));
  const [color, setColor] = useState(DEFAULT_BOOKING_COLOR);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [suggestions, setSuggestions] = useState<CustomerMatch[]>([]);
  const [activeField, setActiveField] = useState<"name" | "phone" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const label = startAt.toLocaleString("sv-SE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  });

  function handleServiceChange(id: string) {
    setServiceId(id);
    const service = services.find((s) => s.id === id);
    if (service) setPrice(String(service.price_sek));
  }

  function scheduleCustomerSearch(query: string) {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSuggestions(await searchCustomers(query));
    }, 250);
  }

  function selectCustomer(customer: CustomerMatch) {
    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email ?? "");
    setSuggestions([]);
    setActiveField(null);
  }

  function renderSuggestions(field: "name" | "phone" | "email") {
    if (activeField !== field || suggestions.length === 0) return null;
    return (
      <div className={styles.customerSuggestions}>
        {suggestions.map((c) => (
          <button
            key={c.phone}
            type="button"
            className={styles.customerSuggestionRow}
            onClick={() => selectCustomer(c)}
          >
            <strong>{c.name}</strong>
            <span>
              {c.phone}
              {c.email ? ` · ${c.email}` : ""}
            </span>
          </button>
        ))}
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId) {
      setError("Lägg till en tjänst innan du kan boka.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("staff", staff);
      formData.set("service_id", serviceId);
      formData.set("start_at", startAt.toISOString());
      formData.set("customer_name", name);
      formData.set("customer_phone", phone);
      formData.set("customer_email", email);
      formData.set("price_sek", price);
      formData.set("color", color);
      formData.set("notes", notes);

      const result = await createBookingAsStaff(formData);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      onClose();
    });
  }

  // Registrerar bara kunden (namn/telefon/mejl) utan att boka den här
  // specifika tiden — t.ex. när man vill lägga in någon man pratat med men
  // inte bestämt en exakt tid med än.
  function handleCreateCustomerOnly() {
    if (!name.trim() || !phone.trim()) {
      setError("Fyll i namn och telefonnummer för att skapa kunden.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("customer_name", name);
      formData.set("customer_phone", phone);
      formData.set("customer_email", email);

      const result = await createCustomerFromCalendar(formData);
      if (!result.ok) {
        setError(result.error ?? "Något gick fel.");
        return;
      }
      onClose();
    });
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2>Ny bokning</h2>
          <button type="button" onClick={onClose} aria-label="Stäng">
            ✕
          </button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-soft)", marginBottom: 14 }}>{label}</p>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <p style={{ color: "var(--warm)", fontSize: "0.85rem" }}>{error}</p>}
          <select value={serviceId} onChange={(e) => handleServiceChange(e.target.value)} required>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration_minutes} min)
              </option>
            ))}
          </select>
          <div style={{ position: "relative" }}>
            <input
              placeholder="Kundens namn"
              value={name}
              onFocus={() => setActiveField("name")}
              onChange={(e) => {
                setName(e.target.value);
                setActiveField("name");
                scheduleCustomerSearch(e.target.value);
              }}
              required
            />
            {renderSuggestions("name")}
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="tel"
              placeholder="Telefonnummer"
              value={phone}
              onFocus={() => setActiveField("phone")}
              onChange={(e) => {
                setPhone(e.target.value);
                setActiveField("phone");
                scheduleCustomerSearch(e.target.value);
              }}
              required
            />
            {renderSuggestions("phone")}
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              placeholder="Mejl"
              value={email}
              onFocus={() => setActiveField("email")}
              onChange={(e) => {
                setEmail(e.target.value);
                setActiveField("email");
                scheduleCustomerSearch(e.target.value);
              }}
              required
            />
            {renderSuggestions("email")}
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? "Bokar..." : "Boka"}
            </button>
            <button
              type="button"
              onClick={handleCreateCustomerOnly}
              className={styles.smallGhostBtn}
              disabled={pending}
            >
              Skapa kund utan bokning
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
