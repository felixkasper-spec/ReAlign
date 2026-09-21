import type { Metadata } from "next";
import Link from "next/link";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEAD_OWNER_LABELS, type LeadOwner } from "@/lib/lead-owner";
import { dateStr, isoWeekday } from "@/lib/booking-slots";
import {
  addWeeklyBlock,
  removeWeeklyBlock,
  addBlockedSlot,
  removeBlockedSlot,
  cancelBooking,
} from "./actions";
import CalendarGrid, { type StaffFilter } from "./CalendarGrid";
import CustomerSearchBar from "./CustomerSearchBar";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Kalender — ReAlign Metoden" };

const WEEK_PARITY_LABELS: Record<string, string> = {
  alla: "Varje vecka",
  jamn: "Jämna veckor",
  udda: "Udda veckor",
};

const WEEKDAYS = [
  { value: 1, label: "Måndag" },
  { value: 2, label: "Tisdag" },
  { value: 3, label: "Onsdag" },
  { value: 4, label: "Torsdag" },
  { value: 5, label: "Fredag" },
  { value: 6, label: "Lördag" },
  { value: 7, label: "Söndag" },
] as const;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ staff?: string; view?: string; date?: string; edit?: string }>;
}) {
  await requireCoach();
  const { staff: staffParam, view: viewParam, date: dateParam, edit: editParam } = await searchParams;
  const editMode = editParam === "1";
  const staffFilter: StaffFilter =
    staffParam === "alla" ? "alla" : staffParam === "christopher" ? "christopher" : "felix";
  // Sektionerna nedanför rutnätet (veckoschema, blockerade tider, kommande
  // bokningar) redigerar en person i taget — "Alla" i väljaren styr bara
  // själva kalenderrutnätet, annars blir formulären för schemaredigering
  // otydliga (vems schema lägger man till om båda visas samtidigt?).
  const singleStaff: LeadOwner = staffFilter === "alla" ? "felix" : staffFilter;
  const staffList: LeadOwner[] = staffFilter === "alla" ? ["felix", "christopher"] : [staffFilter];
  const view: "week" | "day" = viewParam === "day" ? "day" : "week";
  const gridDate =
    dateParam && !Number.isNaN(new Date(`${dateParam}T00:00:00Z`).getTime())
      ? new Date(`${dateParam}T00:00:00Z`)
      : new Date(`${dateStr(new Date())}T00:00:00Z`);

  // Räknar ut visat datumspann (hela veckan för veckovy, en dag för dagsvy)
  // så grid-frågorna nedan bara hämtar bokningar/blockeringar som faktiskt
  // syns i rutnätet, oavsett om man bläddrat bakåt eller framåt i tiden.
  const gridMonday = new Date(gridDate);
  gridMonday.setUTCDate(gridDate.getUTCDate() - (isoWeekday(gridDate) - 1));
  const rangeStart = view === "week" ? gridMonday : gridDate;
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setUTCDate(rangeStart.getUTCDate() + (view === "week" ? 7 : 1));

  const admin = createAdminClient();

  const [
    { data: weeklyBlocks, error: weeklyBlocksError },
    { data: blockedSlots, error: blockedSlotsError },
    { data: upcomingBookings, error: bookingsError },
    { data: services },
    { data: gridWeeklyAvailability },
    { data: gridOpenSlots },
    { data: gridBlockedSlots },
    { data: gridBookingsRaw },
  ] = await Promise.all([
    admin
      .from("booking_weekly_availability")
      .select("id, weekday, start_time, end_time, week_parity")
      .eq("staff", singleStaff)
      .order("weekday")
      .order("start_time"),
    admin
      .from("booking_blocked_slots")
      .select("id, start_at, end_at, reason")
      .eq("staff", singleStaff)
      .gte("end_at", new Date().toISOString())
      .order("start_at"),
    admin
      .from("bookings")
      .select("id, service_id, start_at, end_at, customer_name, customer_phone, customer_email")
      .eq("staff", singleStaff)
      .eq("status", "confirmed")
      .gte("end_at", new Date().toISOString())
      .order("start_at"),
    admin
      .from("booking_services")
      .select("id, name, duration_minutes, price_sek, active")
      .order("sort_order"),
    admin
      .from("booking_weekly_availability")
      .select("weekday, start_time, end_time, week_parity, staff")
      .in("staff", staffList),
    admin
      .from("booking_open_slots")
      .select("start_at, end_at, staff")
      .in("staff", staffList)
      .lt("start_at", rangeEnd.toISOString())
      .gt("end_at", rangeStart.toISOString()),
    admin
      .from("booking_blocked_slots")
      .select("start_at, end_at, staff")
      .in("staff", staffList)
      .lt("start_at", rangeEnd.toISOString())
      .gt("end_at", rangeStart.toISOString()),
    admin
      .from("bookings")
      .select(
        "id, service_id, start_at, end_at, customer_name, customer_phone, customer_email, staff, price_sek, color, notes",
      )
      .in("staff", staffList)
      .eq("status", "confirmed")
      .lt("start_at", rangeEnd.toISOString())
      .gt("end_at", rangeStart.toISOString()),
  ]);

  const serviceNameById = new Map((services ?? []).map((s) => [s.id, s.name]));
  const activeServices = (services ?? []).filter((s) => s.active);
  const gridBookings = (gridBookingsRaw ?? []).map((b) => ({
    id: b.id,
    service_id: b.service_id,
    start_at: b.start_at,
    end_at: b.end_at,
    customer_name: b.customer_name,
    customer_phone: b.customer_phone,
    customer_email: b.customer_email,
    serviceName: serviceNameById.get(b.service_id) ?? "Okänd tjänst",
    staff: b.staff as LeadOwner,
    price_sek: b.price_sek,
    color: b.color,
    notes: b.notes,
  }));

  const loadError = weeklyBlocksError ?? blockedSlotsError ?? bookingsError;
  if (loadError) {
    // T.ex. migration 0011/0012 inte körd i Supabase än (tabellerna eller
    // week_parity-kolumnen saknas) — utan denna logg och banner ser sidan
    // bara ut som ett tomt schema istället för det tekniska felet det är.
    console.error("CalendarPage — kunde inte hämta schema:", loadError);
  }

  const blocksByWeekday = new Map<number, typeof weeklyBlocks>();
  for (const day of WEEKDAYS) blocksByWeekday.set(day.value, []);
  for (const block of weeklyBlocks ?? []) {
    blocksByWeekday.get(block.weekday)?.push(block);
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          margin: "0 0 20px",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>Visar schema för:</span>
        {(["felix", "christopher", "alla"] as const).map((s) => (
          <Link
            key={s}
            href={`/coaching/kalender?staff=${s}&view=${view}&date=${dateStr(gridDate)}`}
            className={styles.leadFilterPill}
            data-active={staffFilter === s || undefined}
          >
            {s === "alla" ? "Alla" : LEAD_OWNER_LABELS[s]}
          </Link>
        ))}
        <Link
          href={`/coaching/kalender?staff=${staffFilter}&view=${view}&date=${dateStr(gridDate)}${editMode ? "" : "&edit=1"}`}
          className={styles.leadFilterPill}
          style={{ margin: "0 auto" }}
          data-active={editMode || undefined}
        >
          {editMode ? "Stäng redigering" : "Öppna/stäng tider"}
        </Link>
        <CustomerSearchBar />
      </div>

      <CalendarGrid
        view={view}
        date={gridDate}
        staffFilter={staffFilter}
        editMode={editMode}
        weeklyAvailability={(gridWeeklyAvailability ?? []).map((b) => ({
          ...b,
          staff: b.staff as LeadOwner,
        }))}
        openSlots={(gridOpenSlots ?? []).map((b) => ({
          ...b,
          staff: b.staff as LeadOwner,
        }))}
        blockedSlots={(gridBlockedSlots ?? []).map((b) => ({
          ...b,
          staff: b.staff as LeadOwner,
        }))}
        bookings={gridBookings}
        services={activeServices}
      />

      <h2 style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>Kommande bokningar</h2>
      {(!upcomingBookings || upcomingBookings.length === 0) && (
        <p className={styles.empty}>Inga kommande bokningar.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
        {(upcomingBookings ?? []).map((booking) => (
          <div key={booking.id} className={styles.contactRow}>
            <div className={styles.rowInfo}>
              <div className={styles.name}>
                {new Date(booking.start_at).toLocaleString("sv-SE", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "UTC",
                })}
                {" – "}
                {new Date(booking.end_at).toLocaleString("sv-SE", {
                  timeStyle: "short",
                  timeZone: "UTC",
                })}
                {" · "}
                {serviceNameById.get(booking.service_id) ?? "Okänd tjänst"}
              </div>
              <div className={styles.contactMessage}>
                {booking.customer_name} · {booking.customer_phone}
                {booking.customer_email ? ` · ${booking.customer_email}` : ""}
              </div>
            </div>
            <form action={cancelBooking.bind(null, booking.id)}>
              <button type="submit" className={styles.journalDeleteBtn}>
                Avboka
              </button>
            </form>
          </div>
        ))}
      </div>

      {loadError && (
        <p
          style={{
            background: "var(--warm-soft)",
            color: "var(--text)",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: "0.9rem",
            marginBottom: 24,
          }}
        >
          Kunde inte hämta schemat just nu (tekniskt fel) — sannolikt en
          databasmigration som inte körts än. Hör av dig till Claude/utveckling
          om det kvarstår.
        </p>
      )}

      <details style={{ marginBottom: 32 }}>
        <summary
          style={{
            fontSize: "1.1rem",
            fontWeight: 500,
            marginBottom: 12,
            cursor: "pointer",
          }}
        >
          Återkommande veckoschema
        </summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {WEEKDAYS.map((day) => {
          const blocks = blocksByWeekday.get(day.value) ?? [];
          return (
            <div
              key={day.value}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "14px 16px",
                background: "var(--surface)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{day.label}</div>
              {blocks.length === 0 && (
                <p style={{ color: "var(--text-soft)", fontSize: "0.85rem", margin: "0 0 10px" }}>
                  Ingen tillgänglighet inlagd.
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                {blocks.map((block) => (
                  <div
                    key={block!.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: "0.88rem",
                    }}
                  >
                    <span>
                      {block!.start_time.slice(0, 5)}–{block!.end_time.slice(0, 5)}
                    </span>
                    {block!.week_parity !== "alla" && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-soft)",
                          background: "rgba(0, 196, 245, 0.14)",
                          borderRadius: 100,
                          padding: "2px 8px",
                        }}
                      >
                        {WEEK_PARITY_LABELS[block!.week_parity]}
                      </span>
                    )}
                    <form action={removeWeeklyBlock.bind(null, block!.id)}>
                      <button
                        type="submit"
                        className={styles.markReadBtn}
                        style={{ padding: "3px 8px", fontSize: "0.78rem" }}
                      >
                        Ta bort
                      </button>
                    </form>
                  </div>
                ))}
              </div>
              <form
                action={addWeeklyBlock}
                style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}
              >
                <input type="hidden" name="staff" value={singleStaff} />
                <input type="hidden" name="weekday" value={day.value} />
                <input
                  type="time"
                  name="start_time"
                  required
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "5px 8px",
                    fontSize: "0.85rem",
                  }}
                />
                <span style={{ color: "var(--text-soft)" }}>–</span>
                <input
                  type="time"
                  name="end_time"
                  required
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "5px 8px",
                    fontSize: "0.85rem",
                  }}
                />
                <select
                  name="week_parity"
                  defaultValue="alla"
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "5px 8px",
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="alla">Varje vecka</option>
                  <option value="jamn">Jämna veckor</option>
                  <option value="udda">Udda veckor</option>
                </select>
                <button
                  type="submit"
                  className={styles.markReadBtn}
                  style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                >
                  + Lägg till
                </button>
              </form>
            </div>
          );
        })}
        </div>
      </details>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>
        Blockerade dagar/tider
      </h2>
      <form
        action={addBlockedSlot}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "14px 16px",
          background: "var(--surface)",
        }}
      >
        <input type="hidden" name="staff" value={singleStaff} />
        <input
          type="date"
          name="date"
          required
          style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px" }}
        />
        <input
          type="time"
          name="start_time"
          required
          style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px" }}
        />
        <span style={{ color: "var(--text-soft)" }}>–</span>
        <input
          type="time"
          name="end_time"
          required
          style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px" }}
        />
        <input
          type="text"
          name="reason"
          placeholder="Anledning (valfritt)"
          style={{
            border: "1px solid var(--line)",
            borderRadius: 8,
            padding: "6px 10px",
            flex: 1,
            minWidth: 140,
          }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px" }}>
          Blockera
        </button>
      </form>

      {(!blockedSlots || blockedSlots.length === 0) && (
        <p className={styles.empty}>Inga kommande blockerade tider.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(blockedSlots ?? []).map((slot) => (
          <div key={slot.id} className={styles.contactRow}>
            <div className={styles.rowInfo}>
              <div className={styles.name}>
                {new Date(slot.start_at).toLocaleString("sv-SE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}{" "}
                –{" "}
                {new Date(slot.end_at).toLocaleString("sv-SE", { timeStyle: "short" })}
              </div>
              {slot.reason && <div className={styles.contactMessage}>{slot.reason}</div>}
            </div>
            <form action={removeBlockedSlot.bind(null, slot.id)}>
              <button type="submit" className={styles.journalDeleteBtn}>
                Ta bort
              </button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
