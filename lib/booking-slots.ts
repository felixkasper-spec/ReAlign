// Räknar ut lediga bokningsbara tider genom att slå ihop det återkommande
// veckoschemat med blockerade perioder och redan bokade tider. All tid
// behandlas som "siffrorna är siffrorna" (samma konvention som
// booking_weekly_availability/booking_blocked_slots redan använder i
// kalender/actions.ts) — ett "09:00" som Felix skriver in blir lagrat och
// visat som 09:00 överallt, utan verklig tidszonskonvertering. Enklare och
// mer förutsägbart än att blanda in Europe/Stockholm-omräkning i en kodbas
// som redan bygger på den här implicita konventionen.

export type WeeklyAvailabilityRow = {
  weekday: number; // 1 (måndag) .. 7 (söndag), ISO 8601
  start_time: string; // "HH:MM" eller "HH:MM:SS"
  end_time: string;
  week_parity: "alla" | "jamn" | "udda";
};

export type BusyRange = { start_at: string; end_at: string };

export type AvailableSlot = { startAt: Date; endAt: Date };

const DEFAULT_DAYS_AHEAD = 21;
const DEFAULT_MIN_LEAD_HOURS = 4;

export function isoWeekday(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

// Standard ISO 8601-veckonummer, räknat i UTC eftersom datumen redan
// behandlas som "siffra = siffra" utan lokal tidszon.
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function isoWeekParity(date: Date): "jamn" | "udda" {
  return isoWeekNumber(date) % 2 === 0 ? "jamn" : "udda";
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function dateStr(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

// "09:30" eller "09:30:00" -> 570. Används för att positionera block i
// kalenderrutnätet (CalendarGrid) och räkna ut vilket timspann som ska visas.
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Slår ihop överlappande/direkt anslutande tidsintervall till sammanhängande
// block — se användningen i computeAvailableSlots för varför det behövs.
function mergeRanges(ranges: { start: Date; end: Date }[]): { start: Date; end: Date }[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: { start: Date; end: Date }[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start.getTime() <= last.end.getTime()) {
      if (cur.end.getTime() > last.end.getTime()) last.end = cur.end;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

export function computeAvailableSlots({
  weeklyAvailability,
  openRanges = [],
  busyRanges,
  durationMinutes,
  now = new Date(),
  daysAhead = DEFAULT_DAYS_AHEAD,
  minLeadHours = DEFAULT_MIN_LEAD_HOURS,
}: {
  weeklyAvailability: WeeklyAvailabilityRow[];
  // Ad-hoc öppnade engångstider (booking_open_slots) — läggs till som
  // bokningsbara block precis som veckoschemat, oberoende av det.
  openRanges?: BusyRange[];
  busyRanges: BusyRange[];
  durationMinutes: number;
  now?: Date;
  daysAhead?: number;
  minLeadHours?: number;
}): AvailableSlot[] {
  const busy = busyRanges.map((b) => ({
    start: new Date(b.start_at),
    end: new Date(b.end_at),
  }));
  const earliestStart = new Date(now.getTime() + minLeadHours * 60 * 60 * 1000);
  const slots: AvailableSlot[] = [];
  const seenStarts = new Set<number>();

  // Varje öppnad ad-hoc-tid (booking_open_slots) är exakt en halvtimmes-
  // cell i kalenderrutnätet — men en tjänst kan vara längre än 30 minuter.
  // Utan att slå ihop angränsande/överlappande celler till sammanhängande
  // block skulle t.ex. två öppnade halvtimmar i följd (10:00–10:30 och
  // 10:30–11:00) aldrig ge en bokningsbar 60-minuterstid, trots att hela
  // timmen faktiskt är öppen.
  const mergedOpenRanges = mergeRanges(
    openRanges.map((o) => ({ start: new Date(o.start_at), end: new Date(o.end_at) })),
  );

  for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
    const day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset),
    );
    const weekday = isoWeekday(day);
    const parity = isoWeekParity(day);
    const ds = dateStr(day);
    const dayStart = new Date(`${ds}T00:00:00Z`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const dayBlocks: { start: Date; end: Date }[] = [];

    for (const b of weeklyAvailability) {
      if (b.weekday !== weekday || (b.week_parity !== "alla" && b.week_parity !== parity)) continue;
      const blockStart = new Date(`${ds}T${b.start_time.slice(0, 5)}:00Z`);
      const blockEnd = new Date(`${ds}T${b.end_time.slice(0, 5)}:00Z`);
      if (Number.isNaN(blockStart.getTime()) || Number.isNaN(blockEnd.getTime())) continue;
      dayBlocks.push({ start: blockStart, end: blockEnd });
    }

    for (const o of mergedOpenRanges) {
      const clippedStart = o.start < dayStart ? dayStart : o.start;
      const clippedEnd = o.end > dayEnd ? dayEnd : o.end;
      if (clippedStart < clippedEnd) {
        dayBlocks.push({ start: clippedStart, end: clippedEnd });
      }
    }

    for (const block of dayBlocks) {
      let slotStart = block.start;
      while (true) {
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
        if (slotEnd > block.end) break;

        if (slotStart >= earliestStart && !seenStarts.has(slotStart.getTime())) {
          const isBusy = busy.some((b) => overlaps(slotStart, slotEnd, b.start, b.end));
          if (!isBusy) {
            slots.push({ startAt: slotStart, endAt: slotEnd });
            seenStarts.add(slotStart.getTime());
          }
        }
        slotStart = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      }
    }
  }

  slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  return slots;
}
