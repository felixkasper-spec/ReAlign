"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  isoWeekday,
  isoWeekNumber,
  isoWeekParity,
  timeToMinutes,
  dateStr,
  overlaps,
  type WeeklyAvailabilityRow,
} from "@/lib/booking-slots";
import { LEAD_OWNER_LABELS, type LeadOwner } from "@/lib/lead-owner";
import { resolveBookingColor } from "@/lib/booking-colors";
import { setSlotOpen, setSlotsOpenBatch } from "./actions";
import MiniCalendarPicker from "./MiniCalendarPicker";
import QuickBookingModal, { type Service } from "./QuickBookingModal";
import BookingDetailModal, { type BookingDetail } from "./BookingDetailModal";
import styles from "./calendar-grid.module.css";

export type StaffFilter = LeadOwner | "alla";

const WEEKDAY_LABELS = ["", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
// Enbokstavsförkortning för veckodagen — visas istället för fulla namnet på
// smala skärmar (à la Bokadirekt), så alla 7 dagarna får plats i veckovyn
// utan att kolumnerna blir oläsligt smala.
const WEEKDAY_SHORT = ["", "M", "T", "O", "T", "F", "L", "S"];
const MONTH_LABELS = [
  "jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec",
];
const SLOT_MINUTES = 30;
// Stora, tydliga timrader (à la Bokadirekt) — inte en kompakt lista. Att
// visa färre timmar åt gången (VISIBLE_HOURS) är det som ger fokus, inte en
// mindre radhöjd.
const ROW_HEIGHT_PX = 46;
// Hela dygnet är alltid renderat (scrollbart) — annars går det inte att
// boka/se tider utanför det befintliga veckoschemat, t.ex. en engångstid
// tidigt en morgon.
const DAY_START_MINUTES = 0;
const DAY_TOTAL_SLOTS = (24 * 60) / SLOT_MINUTES;
// Rutnätets synliga höjd visar bara ungefär en arbetsdag åt gången — resten
// av dygnet finns kvar en scroll bort (se scrollRef-effekten nedan som
// scrollar till strax innan öppettiderna).
const VISIBLE_HOURS = 6.5;
const DAY_HEADER_PX = 34;
const STAFF_SUBHEADER_PX = 26;

type WeeklyRow = WeeklyAvailabilityRow & { staff: LeadOwner };
type BlockedRow = { start_at: string; end_at: string; staff: LeadOwner };

export type Booking = {
  id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  serviceName: string;
  staff: LeadOwner;
  price_sek: number | null;
  color: string | null;
  notes: string | null;
};

function addDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function mondayOf(date: Date): Date {
  return addDays(date, -(isoWeekday(date) - 1));
}

// Är det här halvtimmesblocket tillgängligt — antingen via veckoschemat
// ELLER en ad-hoc öppnad engångstid (booking_open_slots) — och inte täckt
// av en blockerad period? Samma "siffra = siffra"-tidskonvention som resten
// av bokningskoden (se lib/booking-slots.ts).
function isSlotAvailable(
  day: Date,
  minuteOfDay: number,
  weeklyAvailability: WeeklyAvailabilityRow[],
  openSlots: { start_at: string; end_at: string }[],
  blockedSlots: { start_at: string; end_at: string }[],
): boolean {
  const weekday = isoWeekday(day);
  const parity = isoWeekParity(day);
  const ds = dateStr(day);
  const slotStart = new Date(`${ds}T00:00:00Z`).getTime() + minuteOfDay * 60000;
  const slotEnd = slotStart + SLOT_MINUTES * 60000;

  const inWeeklyBlock = weeklyAvailability.some(
    (b) =>
      b.weekday === weekday &&
      (b.week_parity === "alla" || b.week_parity === parity) &&
      minuteOfDay >= timeToMinutes(b.start_time) &&
      minuteOfDay < timeToMinutes(b.end_time),
  );
  const inOpenSlot = openSlots.some((o) =>
    overlaps(new Date(slotStart), new Date(slotEnd), new Date(o.start_at), new Date(o.end_at)),
  );
  if (!inWeeklyBlock && !inOpenSlot) return false;

  const isBlocked = blockedSlots.some((b) =>
    overlaps(new Date(slotStart), new Date(slotEnd), new Date(b.start_at), new Date(b.end_at)),
  );
  return !isBlocked;
}

type PendingCell = { staff: LeadOwner; startAt: string; endAt: string };

export default function CalendarGrid({
  view,
  date,
  staffFilter,
  editMode,
  weeklyAvailability,
  openSlots,
  blockedSlots,
  bookings,
  services,
}: {
  view: "week" | "day";
  date: Date;
  staffFilter: StaffFilter;
  editMode: boolean;
  weeklyAvailability: WeeklyRow[];
  openSlots: BlockedRow[];
  blockedSlots: BlockedRow[];
  bookings: Booking[];
  services: Service[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [quickBookAt, setQuickBookAt] = useState<{ startAt: Date; staff: LeadOwner } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // "Öppna/stäng tider"-läget: mousedown startar alltid en "drag" (även om
  // musen aldrig flyttas — då blir det bara en cell och tolkas som ett
  // enkelt klick vid mouseup). En ref speglar pendingCells så
  // window-mouseup-lyssnaren alltid ser det senaste läget utan stale
  // closures.
  const [editDragging, setEditDragging] = useState(false);
  // Ref-speglad — mouseenter-hanteraren läser draget härifrån istället för
  // React-state, annars kan ett mouseenter-event i undantagsfall hinna
  // köras innan React flusar setEditDragging(true) från mousedown-eventet
  // precis innan, vilket skulle missa den allra första cellen i draget.
  const editDraggingRef = useRef(false);
  const [pendingCells, setPendingCells] = useState<Map<string, PendingCell>>(new Map());
  const pendingCellsRef = useRef<Map<string, PendingCell>>(new Map());
  // Öppna eller stänga? Avgörs av startcellens läge när draget börjar (se
  // handleCellMouseDown) och gäller sen alla celler man drar över — annars
  // skulle draget bara kunna öppna, aldrig stänga flera i ett svep. Vanlig
  // state (inte ref) eftersom värdet läses under rendering för
  // förhandsvisningens färg — refs får inte läsas där.
  const [dragModeOpen, setDragModeOpen] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);
  const [, startEditTransition] = useTransition();

  // Optimistisk overlay: sätts direkt vid mouseup (innan servern ens svarat)
  // så rutorna byter färg omedelbart istället för att vänta på
  // server-actionens tur/retur + revalidering. Nollställs så fort nya props
  // kommer in (oavsett anledning) — då har den riktiga datan redan hunnit
  // ikapp och overlayen behövs inte längre. Görs under rendering (inte i en
  // effect) för att undvika en extra bildruta med inaktuell data.
  const [optimisticOverrides, setOptimisticOverrides] = useState<Map<string, boolean>>(new Map());
  const [prevGridData, setPrevGridData] = useState({ weeklyAvailability, openSlots, blockedSlots });
  if (
    prevGridData.weeklyAvailability !== weeklyAvailability ||
    prevGridData.openSlots !== openSlots ||
    prevGridData.blockedSlots !== blockedSlots
  ) {
    setPrevGridData({ weeklyAvailability, openSlots, blockedSlots });
    setOptimisticOverrides(new Map());
  }

  function cellKey(day: Date, staffMember: LeadOwner, minuteOfDay: number): string {
    return `${dateStr(day)}-${staffMember}-${minuteOfDay}`;
  }

  function slotTimes(day: Date, minuteOfDay: number): { startAt: string; endAt: string } {
    const start = new Date(`${dateStr(day)}T00:00:00Z`);
    start.setUTCMinutes(minuteOfDay);
    const end = new Date(start.getTime() + SLOT_MINUTES * 60000);
    return { startAt: start.toISOString(), endAt: end.toISOString() };
  }

  function checkAvailable(day: Date, staffMember: LeadOwner, minuteOfDay: number): boolean {
    const colAvailability = weeklyAvailability.filter((b) => b.staff === staffMember);
    const colOpen = openSlots.filter((o) => o.staff === staffMember);
    const colBlocked = blockedSlots.filter((b) => b.staff === staffMember);
    return isSlotAvailable(day, minuteOfDay, colAvailability, colOpen, colBlocked);
  }

  function addPendingCell(day: Date, staffMember: LeadOwner, minuteOfDay: number) {
    const key = cellKey(day, staffMember, minuteOfDay);
    if (pendingCellsRef.current.has(key)) return;
    const { startAt, endAt } = slotTimes(day, minuteOfDay);
    pendingCellsRef.current.set(key, { staff: staffMember, startAt, endAt });
    setPendingCells(new Map(pendingCellsRef.current));
  }

  function handleCellMouseDown(day: Date, staffMember: LeadOwner, minuteOfDay: number) {
    if (!editMode) return;
    setEditError(null);
    pendingCellsRef.current = new Map();
    setDragModeOpen(!checkAvailable(day, staffMember, minuteOfDay));
    addPendingCell(day, staffMember, minuteOfDay);
    editDraggingRef.current = true;
    setEditDragging(true);
  }

  function handleCellMouseEnter(day: Date, staffMember: LeadOwner, minuteOfDay: number) {
    if (!editMode || !editDraggingRef.current) return;
    addPendingCell(day, staffMember, minuteOfDay);
  }

  // Global mouseup — fångar även om musen släpps utanför rutnätet.
  useEffect(() => {
    if (!editDragging) return;
    function handleUp() {
      editDraggingRef.current = false;
      setEditDragging(false);
      const cells = [...pendingCellsRef.current.values()];
      pendingCellsRef.current = new Map();
      setPendingCells(new Map());
      if (cells.length === 0) return;

      const open = dragModeOpen;

      // Optimistisk uppdatering direkt — inga väntan på servern för att
      // rutorna ska byta färg.
      setOptimisticOverrides((prev) => {
        const next = new Map(prev);
        for (const c of cells) {
          const d = new Date(c.startAt);
          const ds = dateStr(d);
          const minuteOfDay = d.getUTCHours() * 60 + d.getUTCMinutes();
          next.set(`${ds}-${c.staff}-${minuteOfDay}`, open);
        }
        return next;
      });

      if (cells.length === 1) {
        const only = cells[0];
        startEditTransition(async () => {
          const result = await setSlotOpen(only.staff, only.startAt, only.endAt, open);
          if (!result.ok) {
            console.error("setSlotOpen misslyckades:", result.error);
            setEditError(
              result.error ??
                "Kunde inte spara ändringen — kontrollera att migration 0021 (booking_open_slots) har körts.",
            );
          }
        });
      } else {
        startEditTransition(async () => {
          const result = await setSlotsOpenBatch(cells, open);
          if (!result.ok) {
            console.error("setSlotsOpenBatch misslyckades:", result.error);
            setEditError(
              result.error ??
                "Kunde inte spara ändringen — kontrollera att migration 0021 (booking_open_slots) har körts.",
            );
          }
        });
      }
    }
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDragging]);

  const staffList: LeadOwner[] =
    staffFilter === "alla" ? ["felix", "christopher"] : [staffFilter];
  const showStaffSubHeader = staffList.length > 1;
  const headerRows = showStaffSubHeader ? 2 : 1;
  const headerPx = DAY_HEADER_PX + (showStaffSubHeader ? STAFF_SUBHEADER_PX : 0);
  const scrollAreaMaxHeight = headerPx + VISIBLE_HOURS * (60 / SLOT_MINUTES) * ROW_HEIGHT_PX;

  const monday = mondayOf(date);
  const days = view === "week" ? Array.from({ length: 7 }, (_, i) => addDays(monday, i)) : [date];
  const columns = days.flatMap((day) => staffList.map((staffMember) => ({ day, staffMember })));

  const times = weeklyAvailability.flatMap((b) => [
    timeToMinutes(b.start_time),
    timeToMinutes(b.end_time),
  ]);
  const businessStartHour = times.length ? Math.floor(Math.min(...times) / 60) : 8;

  const prevDate = addDays(view === "week" ? monday : date, view === "week" ? -7 : -1);
  const nextDate = addDays(view === "week" ? monday : date, view === "week" ? 7 : 1);
  const todayStr = dateStr(new Date());

  const headerLabel =
    view === "week"
      ? `Vecka ${isoWeekNumber(monday)}, ${MONTH_LABELS[monday.getUTCMonth()]}`
      : `${WEEKDAY_LABELS[isoWeekday(date)]} ${date.getUTCDate()} ${MONTH_LABELS[date.getUTCMonth()]}`;

  // Scrollar till strax innan öppettiderna börjar när sidan laddas, istället
  // för att alltid visa midnatt högst upp — hela dygnet finns kvar en
  // scroll bort.
  useEffect(() => {
    const container = scrollRef.current;
    const scrollToHour = Math.max(businessStartHour - 1, 0);
    const target = container?.querySelector<HTMLElement>(`[data-hour-row="${scrollToHour}"]`);
    if (container && target) {
      container.scrollTop = target.offsetTop - container.offsetTop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, date.getTime()]);

  function linkFor(params: { view?: "week" | "day"; d?: Date }) {
    const v = params.view ?? view;
    const d = params.d ?? date;
    return `/coaching/kalender?staff=${staffFilter}&view=${v}&date=${dateStr(d)}`;
  }

  return (
    <div className={styles.wrap} style={editDragging ? { userSelect: "none" } : undefined}>
      {editMode && editError && (
        <p
          style={{
            background: "var(--warm-soft)",
            color: "var(--text)",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: "0.85rem",
            marginBottom: 10,
          }}
        >
          {editError}
        </p>
      )}
      <div className={styles.toolbar}>
        <div className={styles.nav}>
          <Link href={linkFor({ d: prevDate })} className={styles.navBtn} aria-label="Föregående">
            ←
          </Link>
          <Link href={linkFor({ d: new Date(`${todayStr}T00:00:00Z`) })} className={styles.todayBtn}>
            Idag
          </Link>
          <Link href={linkFor({ d: nextDate })} className={styles.navBtn} aria-label="Nästa">
            →
          </Link>
          <button type="button" className={styles.headerLabelBtn} onClick={() => setPickerOpen(true)}>
            {headerLabel} ▾
          </button>
        </div>
        <div className={styles.viewToggle}>
          <Link
            href={linkFor({ view: "week" })}
            className={styles.toggleBtn}
            data-active={view === "week" || undefined}
          >
            Vecka
          </Link>
          <Link
            href={linkFor({ view: "day" })}
            className={styles.toggleBtn}
            data-active={view === "day" || undefined}
          >
            Dag
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={styles.scrollArea}
        style={{ maxHeight: `${scrollAreaMaxHeight}px` }}
      >
        <div
          className={styles.grid}
          style={
            {
              "--col-count": columns.length,
              gridTemplateRows: `repeat(${headerRows}, auto) repeat(${DAY_TOTAL_SLOTS}, ${ROW_HEIGHT_PX}px)`,
            } as React.CSSProperties
          }
        >
          <div
            className={styles.cornerCell}
            style={{ gridColumn: 1, gridRow: `1 / span ${headerRows}` }}
          />
          {days.map((day, dayIndex) => {
            const headerStyle = {
              gridColumn: `${dayIndex * staffList.length + 2} / span ${staffList.length}`,
              gridRow: 1,
            };
            const headerContent =
              view === "week" || showStaffSubHeader ? (
                <>
                  <span className={styles.dayHeaderNum}>{day.getUTCDate()}</span>{" "}
                  <span className={styles.dayHeaderFull}>{WEEKDAY_LABELS[isoWeekday(day)]}</span>
                  <span className={styles.dayHeaderShort}>{WEEKDAY_SHORT[isoWeekday(day)]}</span>
                </>
              ) : (
                LEAD_OWNER_LABELS[staffList[0]]
              );

            // Klickbar bara i veckovyn — tar en direkt till dagsvyn för just
            // den dagen. I dagsvyn är man redan där, ingen anledning att
            // länka till sig själv.
            return view === "week" ? (
              <Link
                key={dateStr(day)}
                href={linkFor({ view: "day", d: day })}
                className={styles.dayHeader}
                style={headerStyle}
              >
                {headerContent}
              </Link>
            ) : (
              <div key={dateStr(day)} className={styles.dayHeader} style={headerStyle}>
                {headerContent}
              </div>
            );
          })}

          {showStaffSubHeader &&
            columns.map((col, colIndex) => (
              <div
                key={`staffhead-${colIndex}`}
                className={styles.staffSubHeader}
                style={{ gridColumn: colIndex + 2, gridRow: 2 }}
              >
                <span className={styles.staffAvatar}>
                  {LEAD_OWNER_LABELS[col.staffMember].charAt(0)}
                </span>
                {LEAD_OWNER_LABELS[col.staffMember]}
              </div>
            ))}

          {Array.from({ length: DAY_TOTAL_SLOTS }, (_, slotIndex) => {
            const minuteOfDay = DAY_START_MINUTES + slotIndex * SLOT_MINUTES;
            const hour = Math.floor(minuteOfDay / 60);
            const isHour = minuteOfDay % 60 === 0;
            return (
              <div
                key={`label-${slotIndex}`}
                className={styles.timeLabel}
                data-hour-row={isHour ? hour : undefined}
                style={{ gridColumn: 1, gridRow: slotIndex + headerRows + 1 }}
              >
                {isHour ? `${String(hour).padStart(2, "0")}:00` : "30"}
              </div>
            );
          })}

          {columns.map((col, colIndex) => {
            const colAvailability = weeklyAvailability.filter((b) => b.staff === col.staffMember);
            const colOpen = openSlots.filter((o) => o.staff === col.staffMember);
            const colBlocked = blockedSlots.filter((b) => b.staff === col.staffMember);
            return Array.from({ length: DAY_TOTAL_SLOTS }, (_, slotIndex) => {
              const minuteOfDay = DAY_START_MINUTES + slotIndex * SLOT_MINUTES;
              const key = cellKey(col.day, col.staffMember, minuteOfDay);
              const override = optimisticOverrides.get(key);
              const available =
                override !== undefined
                  ? override
                  : isSlotAvailable(col.day, minuteOfDay, colAvailability, colOpen, colBlocked);
              const pendingCell = editMode ? pendingCells.get(key) : undefined;
              return (
                <div
                  key={`cell-${colIndex}-${slotIndex}`}
                  className={styles.cell}
                  data-available={available || undefined}
                  data-pending={pendingCell ? (dragModeOpen ? "open" : "close") : undefined}
                  style={{ gridColumn: colIndex + 2, gridRow: slotIndex + headerRows + 1 }}
                  onMouseDown={
                    editMode
                      ? () => handleCellMouseDown(col.day, col.staffMember, minuteOfDay)
                      : undefined
                  }
                  onMouseEnter={
                    editMode
                      ? () => handleCellMouseEnter(col.day, col.staffMember, minuteOfDay)
                      : undefined
                  }
                  onClick={
                    editMode
                      ? undefined
                      : () => {
                          const startAt = new Date(`${dateStr(col.day)}T00:00:00Z`);
                          startAt.setUTCMinutes(minuteOfDay);
                          setQuickBookAt({ startAt, staff: col.staffMember });
                        }
                  }
                />
              );
            });
          })}

          {columns.map((col, colIndex) => {
            const ds = dateStr(col.day);
            const colBookings = bookings.filter(
              (b) => b.start_at.slice(0, 10) === ds && b.staff === col.staffMember,
            );
            return colBookings.map((booking) => {
              const start = new Date(booking.start_at);
              const end = new Date(booking.end_at);
              const startMinuteOfDay = start.getUTCHours() * 60 + start.getUTCMinutes();
              const endMinuteOfDay = end.getUTCHours() * 60 + end.getUTCMinutes();
              // floor/ceil (inte round) så att en bokning aldrig visas kortare
              // än den verkligen är bara för att den inte träffar en exakt
              // halvtimme (t.ex. 14:00–14:40).
              const rowStart =
                Math.max(0, Math.floor(startMinuteOfDay / SLOT_MINUTES)) + headerRows + 1;
              const rowEnd = Math.max(
                rowStart + 1,
                Math.ceil(endMinuteOfDay / SLOT_MINUTES) + headerRows + 1,
              );
              if (rowEnd <= headerRows + 1 || rowStart >= DAY_TOTAL_SLOTS + headerRows + 1) {
                return null;
              }

              return (
                <div
                  key={booking.id}
                  className={styles.booking}
                  style={{
                    gridColumn: colIndex + 2,
                    gridRow: `${rowStart} / ${rowEnd}`,
                    background: resolveBookingColor(booking.color),
                  }}
                  onClick={() =>
                    setSelectedBooking({
                      id: booking.id,
                      service_id: booking.service_id,
                      start_at: booking.start_at,
                      end_at: booking.end_at,
                      customer_name: booking.customer_name,
                      customer_phone: booking.customer_phone,
                      customer_email: booking.customer_email,
                      serviceName: booking.serviceName,
                      staff: booking.staff,
                      price_sek: booking.price_sek,
                      color: booking.color,
                      notes: booking.notes,
                    })
                  }
                >
                  <div className={styles.bookingTime}>
                    {String(start.getUTCHours()).padStart(2, "0")}:
                    {String(start.getUTCMinutes()).padStart(2, "0")}–
                    {String(end.getUTCHours()).padStart(2, "0")}:
                    {String(end.getUTCMinutes()).padStart(2, "0")}
                  </div>
                  <div className={styles.bookingName}>{booking.customer_name}</div>
                  <div className={styles.bookingService}>{booking.serviceName}</div>
                </div>
              );
            });
          })}
        </div>
      </div>

      {pickerOpen && (
        <MiniCalendarPicker
          selectedDate={date}
          staff={staffFilter}
          view={view}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {quickBookAt && (
        <QuickBookingModal
          startAt={quickBookAt.startAt}
          staff={quickBookAt.staff}
          services={services}
          onClose={() => setQuickBookAt(null)}
        />
      )}

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          services={services}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
