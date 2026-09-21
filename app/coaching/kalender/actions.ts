"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/customer-identity";

const STAFF = ["felix", "christopher"] as const;
type Staff = (typeof STAFF)[number];

const WEEK_PARITIES = ["alla", "jamn", "udda"] as const;
type WeekParity = (typeof WEEK_PARITIES)[number];

function isStaff(value: string | null): value is Staff {
  return STAFF.includes(value as Staff);
}

function isWeekParity(value: string | null): value is WeekParity {
  return WEEK_PARITIES.includes(value as WeekParity);
}

export async function addWeeklyBlock(formData: FormData) {
  await requireCoach();

  const staff = formData.get("staff") as string;
  const weekday = Number(formData.get("weekday"));
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;
  const weekParityRaw = formData.get("week_parity") as string;
  const weekParity = isWeekParity(weekParityRaw) ? weekParityRaw : "alla";

  if (!isStaff(staff) || !weekday || weekday < 1 || weekday > 7 || !startTime || !endTime) {
    return;
  }
  if (startTime >= endTime) return;

  const admin = createAdminClient();
  const { error } = await admin.from("booking_weekly_availability").insert({
    staff,
    weekday,
    start_time: startTime,
    end_time: endTime,
    week_parity: weekParity,
  });

  if (error) {
    // T.ex. en migration som inte körts (tabellen/kolumnen saknas) — utan
    // denna logg ser det bara ut som att knappen inte gör något.
    console.error("addWeeklyBlock — kunde inte spara:", error);
  }

  revalidatePath("/coaching/kalender");
}

export async function removeWeeklyBlock(id: string) {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin.from("booking_weekly_availability").delete().eq("id", id);
  if (error) {
    console.error("removeWeeklyBlock — kunde inte ta bort:", error);
  }

  revalidatePath("/coaching/kalender");
}

export async function addBlockedSlot(formData: FormData) {
  await requireCoach();

  const staff = formData.get("staff") as string;
  const date = formData.get("date") as string;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;
  const reason = (formData.get("reason") as string)?.trim() || null;

  if (!isStaff(staff) || !date || !startTime || !endTime) return;
  if (startTime >= endTime) return;

  const startAt = new Date(`${date}T${startTime}:00`);
  const endAt = new Date(`${date}T${endTime}:00`);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) return;

  const admin = createAdminClient();
  const { error } = await admin.from("booking_blocked_slots").insert({
    staff,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    reason,
  });

  if (error) {
    console.error("addBlockedSlot — kunde inte spara:", error);
  }

  revalidatePath("/coaching/kalender");
}

export async function removeBlockedSlot(id: string) {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin.from("booking_blocked_slots").delete().eq("id", id);
  if (error) {
    console.error("removeBlockedSlot — kunde inte ta bort:", error);
  }

  revalidatePath("/coaching/kalender");
}

export async function cancelBooking(id: string) {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin.from("bookings").update({ status: "cancelled" }).eq("id", id);
  if (error) {
    console.error("cancelBooking — kunde inte avboka:", error);
  }

  revalidatePath("/coaching/kalender");
}

export async function createService(
  name: string,
  durationMinutes: number,
  priceSek: number,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  if (!name.trim() || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return { ok: false, error: "Fyll i namn och en giltig längd." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("booking_services").insert({
    name: name.trim(),
    duration_minutes: durationMinutes,
    price_sek: Number.isFinite(priceSek) && priceSek > 0 ? priceSek : 0,
  });

  if (error) {
    console.error("createService — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara tjänsten." };
  }

  revalidatePath("/coaching/kalender");
  return { ok: true };
}

export async function toggleServiceActive(id: string, active: boolean) {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin.from("booking_services").update({ active }).eq("id", id);
  if (error) {
    console.error("toggleServiceActive — kunde inte uppdatera:", error);
  }

  revalidatePath("/coaching/kalender");
}

// Coachen bokar direkt i kalendern (t.ex. en kund som ringde in) — samma
// krockkontroll och datamodell som det publika bokningsflödet i
// app/boka/actions.ts, men utan tjänstefiltret på existing_clients_only och
// utan Pushover-notis (coachen vet redan om bokningen, hen skapade den).
export async function createBookingAsStaff(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  const staff = formData.get("staff") as string;
  const serviceId = formData.get("service_id") as string;
  const startAtRaw = formData.get("start_at") as string;
  const name = (formData.get("customer_name") as string)?.trim();
  const phone = (formData.get("customer_phone") as string)?.trim();
  const email = (formData.get("customer_email") as string)?.trim();

  if (!isStaff(staff) || !serviceId || !startAtRaw || !name || !phone || !email) {
    return { ok: false, error: "Fyll i alla obligatoriska fält." };
  }

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) {
    return { ok: false, error: "Ogiltig tid." };
  }

  const admin = createAdminClient();
  const { data: service } = await admin
    .from("booking_services")
    .select("id, duration_minutes")
    .eq("id", serviceId)
    .maybeSingle();

  if (!service) {
    return { ok: false, error: "Tjänsten hittades inte." };
  }

  const endAt = new Date(startAt.getTime() + service.duration_minutes * 60 * 1000);

  const { data: conflicting } = await admin
    .from("bookings")
    .select("id")
    .eq("staff", staff)
    .eq("status", "confirmed")
    .lt("start_at", endAt.toISOString())
    .gt("end_at", startAt.toISOString())
    .limit(1);

  if (conflicting && conflicting.length > 0) {
    return { ok: false, error: "Den tiden krockar med en annan bokning." };
  }

  const priceRaw = formData.get("price_sek") as string;
  const priceSek = Number.isFinite(Number(priceRaw)) ? Math.max(0, Math.round(Number(priceRaw))) : null;
  const color = (formData.get("color") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const { error } = await admin.from("bookings").insert({
    service_id: service.id,
    staff,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    customer_name: name,
    customer_phone: phone,
    customer_email: email,
    price_sek: priceSek,
    color,
    notes,
  });

  if (error) {
    console.error("createBookingAsStaff — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara bokningen." };
  }

  // Registrerar/uppdaterar kunden i customers-tabellen också, så den dyker
  // upp direkt i kundlistan — inte bara indirekt via bokningen. Rör bara
  // namn/mejl, aldrig linked_user_id, så en befintlig inloggningskoppling
  // inte nollställs av misstag.
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    const { error: customerError } = await admin
      .from("customers")
      .upsert({ phone: normalizedPhone, name, email }, { onConflict: "phone" });
    if (customerError) {
      console.error("createBookingAsStaff — kunde inte uppdatera kunden:", customerError);
    }
  }

  revalidatePath("/coaching/kalender");
  revalidatePath("/coaching/kunder");
  return { ok: true };
}

// Skapar en kund direkt från kalenderns bokningsskapare, utan att boka en
// specifik tid — t.ex. när man vill registrera en kund man pratat med men
// inte bestämt en exakt tid med än. Samma upsert-mönster som kundsidans
// "Lägg till kund" (se app/coaching/kunder/actions.ts).
export async function createCustomerFromCalendar(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; phone?: string }> {
  await requireCoach();

  const name = (formData.get("customer_name") as string)?.trim();
  const phone = (formData.get("customer_phone") as string)?.trim();
  const email = (formData.get("customer_email") as string)?.trim() || null;

  const normalizedPhone = normalizePhone(phone ?? "");
  if (!name || !normalizedPhone) {
    return { ok: false, error: "Namn och telefonnummer krävs." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("customers")
    .upsert({ phone: normalizedPhone, name, email }, { onConflict: "phone" });

  if (error) {
    console.error("createCustomerFromCalendar — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte skapa kunden." };
  }

  revalidatePath("/coaching/kunder");
  return { ok: true, phone: normalizedPhone };
}

// Justerar en befintlig bokning (öppnas från BookingDetailModal). Till
// skillnad från skapandet räknas sluttiden inte om från tjänstens
// duration_minutes vid ett tjänstebyte — coachen styr start/sluttid
// direkt i formuläret, oberoende av vilken tjänst som är vald.
export async function updateBooking(
  id: string,
  staff: string,
  serviceId: string,
  startAtRaw: string,
  endAtRaw: string,
  priceSekRaw: string,
  color: string,
  notes: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  if (!isStaff(staff)) {
    return { ok: false, error: "Ogiltig behandlare." };
  }
  if (!serviceId) {
    return { ok: false, error: "Välj en tjänst." };
  }

  const startAt = new Date(startAtRaw);
  const endAt = new Date(endAtRaw);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    return { ok: false, error: "Ogiltig tid." };
  }

  const admin = createAdminClient();

  const { data: service } = await admin
    .from("booking_services")
    .select("id")
    .eq("id", serviceId)
    .maybeSingle();
  if (!service) {
    return { ok: false, error: "Tjänsten hittades inte." };
  }

  const { data: conflicting } = await admin
    .from("bookings")
    .select("id")
    .eq("staff", staff)
    .eq("status", "confirmed")
    .neq("id", id)
    .lt("start_at", endAt.toISOString())
    .gt("end_at", startAt.toISOString())
    .limit(1);

  if (conflicting && conflicting.length > 0) {
    return { ok: false, error: "Den nya tiden krockar med en annan bokning." };
  }

  const priceSek = Number.isFinite(Number(priceSekRaw))
    ? Math.max(0, Math.round(Number(priceSekRaw)))
    : null;

  const { error } = await admin
    .from("bookings")
    .update({
      service_id: serviceId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      price_sek: priceSek,
      color: color?.trim() || null,
      notes: notes?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    console.error("updateBooking — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara ändringen." };
  }

  revalidatePath("/coaching/kalender");
  return { ok: true };
}

export type CustomerMatch = { name: string; phone: string; email: string | null };

// Slår ihop bokningar per kund (samma "senaste bokning vinner"-dedupe som
// kundlistan i app/coaching/kunder/page.tsx) och filtrerar på namn, mejl
// eller telefon — matchar var som helst i namnet så både för- och
// efternamn hittas, inte bara ett prefix.
export async function searchCustomers(query: string): Promise<CustomerMatch[]> {
  await requireCoach();

  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const admin = createAdminClient();
  const { data: bookings } = await admin
    .from("bookings")
    .select("customer_name, customer_phone, customer_email, start_at")
    .order("start_at", { ascending: false });

  const digits = q.replace(/\D/g, "");
  const byPhone = new Map<string, CustomerMatch>();
  for (const b of bookings ?? []) {
    const phone = normalizePhone(b.customer_phone);
    if (!phone || byPhone.has(phone)) continue;

    const nameMatch = b.customer_name?.toLowerCase().includes(q);
    const emailMatch = b.customer_email?.toLowerCase().includes(q);
    const phoneMatch = digits.length >= 2 && phone.includes(digits);
    if (nameMatch || emailMatch || phoneMatch) {
      byPhone.set(phone, { name: b.customer_name, phone, email: b.customer_email });
    }
  }

  return [...byPhone.values()].slice(0, 8);
}

// Slår på/av en enskild halvtimmes-cell i "Öppna/stäng tider"-läget.
// Symmetrisk — oavsett VARFÖR cellen visades som (o)tillgänglig innan
// klicket (veckoschema, ad-hoc-öppning eller blockering) landar den alltid
// i rätt läge efteråt:
//  - Öppna: ta bort en ev. blockering för exakt den halvtimmen, och se
//    till att en booking_open_slots-rad finns.
//  - Stäng: ta bort en ev. ad-hoc-öppning, och se till att en
//    booking_blocked_slots-rad finns (så veckoschemat också trycks ner).
export async function setSlotOpen(
  staff: string,
  startAtRaw: string,
  endAtRaw: string,
  open: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  if (!isStaff(staff)) return { ok: false, error: "Ogiltig behandlare." };

  const startAt = new Date(startAtRaw);
  const endAt = new Date(endAtRaw);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
    return { ok: false, error: "Ogiltig tid." };
  }

  const admin = createAdminClient();
  const startIso = startAt.toISOString();
  const endIso = endAt.toISOString();

  if (open) {
    await admin
      .from("booking_blocked_slots")
      .delete()
      .eq("staff", staff)
      .eq("start_at", startIso)
      .eq("end_at", endIso);
    const { error } = await admin
      .from("booking_open_slots")
      .upsert({ staff, start_at: startIso, end_at: endIso }, { onConflict: "staff,start_at,end_at" });
    if (error) {
      console.error("setSlotOpen — kunde inte öppna:", error);
      return { ok: false, error: "Kunde inte öppna tiden." };
    }
  } else {
    await admin
      .from("booking_open_slots")
      .delete()
      .eq("staff", staff)
      .eq("start_at", startIso)
      .eq("end_at", endIso);
    const { error } = await admin
      .from("booking_blocked_slots")
      .upsert({ staff, start_at: startIso, end_at: endIso }, { onConflict: "staff,start_at,end_at" });
    if (error) {
      console.error("setSlotOpen — kunde inte stänga:", error);
      return { ok: false, error: "Kunde inte stänga tiden." };
    }
  }

  revalidatePath("/coaching/kalender");
  return { ok: true };
}

// Öppnar flera halvtimmes-celler i ett svep — "dra"-funktionen i
// kalenderrutnätet. Öppnar alltid (till skillnad från den enskilda
// togglingen ovan), oavsett vilket läge cellerna hade innan draget.
// Drag-funktionen — sätter alla celler i draget till SAMMA läge (öppna
// eller stänga), avgjort av vilket läge startcellen hade när draget
// började (se CalendarGrid.tsx: dragModeRef sätts vid mousedown).
export async function setSlotsOpenBatch(
  entries: { staff: string; startAt: string; endAt: string }[],
  open: boolean,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  if (entries.length === 0) return { ok: false, error: "Inget valt." };

  const admin = createAdminClient();
  const rows: { staff: Staff; start_at: string; end_at: string }[] = [];

  for (const e of entries) {
    if (!isStaff(e.staff)) continue;
    const startAt = new Date(e.startAt);
    const endAt = new Date(e.endAt);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) continue;
    const startIso = startAt.toISOString();
    const endIso = endAt.toISOString();
    rows.push({ staff: e.staff, start_at: startIso, end_at: endIso });

    const clearTable = open ? "booking_blocked_slots" : "booking_open_slots";
    await admin
      .from(clearTable)
      .delete()
      .eq("staff", e.staff)
      .eq("start_at", startIso)
      .eq("end_at", endIso);
  }

  if (rows.length === 0) return { ok: false, error: "Inget giltigt valt." };

  const targetTable = open ? "booking_open_slots" : "booking_blocked_slots";
  const { error } = await admin
    .from(targetTable)
    .upsert(rows, { onConflict: "staff,start_at,end_at" });

  if (error) {
    console.error("setSlotsOpenBatch — kunde inte spara:", error);
    return { ok: false, error: open ? "Kunde inte öppna tiderna." : "Kunde inte stänga tiderna." };
  }

  revalidatePath("/coaching/kalender");
  return { ok: true };
}
