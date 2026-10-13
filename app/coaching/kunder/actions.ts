"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/customer-identity";
import { upsertCustomerFields } from "@/lib/customer-upsert";
import {
  COACHING_JOURNAL_BUCKET,
  MAX_JOURNAL_ATTACHMENT_BYTES,
  journalAttachmentTypeFromMime,
} from "@/lib/coaching-journal";

// Skapar (eller uppdaterar namn/mejl på) en kund direkt, utan att kräva en
// bokning — se customers-tabellen (migration 0071, som också håller
// login-kopplingen). upsertCustomerFields rör bara namn/mejl, aldrig
// linked_user_id, så en befintlig inloggningskoppling aldrig nollställs av
// misstag här (ett vanligt .upsert() med ett enda objekt hade gjort precis
// det, se lib/customer-upsert.ts).
export async function createCustomer(
  name: string,
  phone: string,
  email: string,
): Promise<{ ok: boolean; error?: string; phone?: string }> {
  await requireCoach();

  const trimmedName = name.trim();
  const normalizedPhone = normalizePhone(phone);
  if (!trimmedName || !normalizedPhone) {
    return { ok: false, error: "Namn och telefonnummer krävs." };
  }

  const admin = createAdminClient();
  const { error } = await upsertCustomerFields(admin, normalizedPhone, {
    name: trimmedName,
    email: email.trim() || null,
  });

  if (error) {
    console.error("createCustomer — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte skapa kunden." };
  }

  revalidatePath("/coaching/kunder");
  return { ok: true, phone: normalizedPhone };
}

// Signerad uppladdnings-URL, precis som ReAligns coaching-chatt — kringgår
// gränsen för hur stor en server actions body får vara, och bucketen är
// privat så läsning sker bara via signerade URL:er som genereras när sidan
// renderas (se page.tsx). Använder service_role-klienten rakt av eftersom
// det inte finns någon klientpolicy att uppfylla (internt verktyg, ingen
// kund-autentisering att koppla en RLS-policy till).
export async function createJournalAttachmentUploadUrl(
  fileName: string,
  fileSize: number,
  mime: string,
) {
  await requireCoach();

  if (fileSize > MAX_JOURNAL_ATTACHMENT_BYTES) {
    throw new Error("Filen är för stor (max 25 MB).");
  }

  const type = journalAttachmentTypeFromMime(mime);
  if (!type) {
    throw new Error("Bara bilder och videor kan bifogas.");
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
  const path = `journal/${crypto.randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(COACHING_JOURNAL_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error("Kunde inte förbereda uppladdningen.");
  }

  return { path, token: data.token, type };
}

export async function addJournalEntry(
  customerPhone: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  const body = (formData.get("body") as string)?.trim() ?? "";
  const attachmentPath = (formData.get("attachment_path") as string) || null;
  const attachmentType = (formData.get("attachment_type") as string) || null;
  const bookingId = (formData.get("booking_id") as string) || null;

  if (!body && !attachmentPath) {
    return { ok: false, error: "Skriv en anteckning eller bifoga en fil." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("coaching_journal_entries").insert({
    customer_phone: customerPhone,
    body,
    attachment_path: attachmentPath,
    attachment_type: attachmentType,
    booking_id: bookingId || null,
  });

  if (error) {
    console.error("addJournalEntry — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara anteckningen, försök igen." };
  }

  revalidatePath(`/coaching/kunder/${customerPhone}`);
  return { ok: true };
}

export async function updateJournalEntry(
  id: string,
  customerPhone: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Anteckningen kan inte vara tom." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("coaching_journal_entries")
    .update({ body: trimmed })
    .eq("id", id);

  if (error) {
    console.error("updateJournalEntry — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara ändringen." };
  }

  revalidatePath(`/coaching/kunder/${customerPhone}`);
  return { ok: true };
}

export async function deleteJournalEntry(id: string, customerPhone: string) {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin.from("coaching_journal_entries").delete().eq("id", id);
  if (error) {
    console.error("deleteJournalEntry — kunde inte ta bort:", error);
  }

  revalidatePath(`/coaching/kunder/${customerPhone}`);
}

export type ProfileMatch = { id: string; email: string; displayName: string | null };

// Sök bland inloggade konton (profiles) för att koppla ihop en fysisk
// klinikkund (telefonbaserad) med ett inlogg — se LoginLink.tsx. Söker på
// mejl eller visningsnamn, inte lösenord/annat känsligt.
export async function searchProfilesForLink(query: string): Promise<ProfileMatch[]> {
  await requireCoach();

  const q = query.trim();
  if (q.length < 2) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, email, display_name")
    .or(`email.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(8);

  return (data ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    displayName: p.display_name,
  }));
}

// Kopplar (eller uppdaterar kopplingen för) en kund till ett inlogg —
// upsertar customers-raden så den alltid finns oavsett om kunden redan
// dykt upp via en bokning/journalanteckning eller inte. Detta är vad som
// gör att coachens meddelande-inkorg (se app/coaching/page.tsx och
// [userId]/page.tsx) kan visa vilken fysisk kund en chatt-tråd tillhör.
export async function linkCustomerLogin(
  phone: string,
  userId: string,
  customerName: string | null,
): Promise<{ ok: boolean; error?: string }> {
  await requireCoach();

  const admin = createAdminClient();

  // Varje konto får redan en egen kundrad vid registrering (se
  // handle_new_user-triggern, migration 0077), kopplad via linked_user_id
  // men ofta utan telefon ännu. Den raden kan alltså redan finnas separat
  // från den telefon-rad som bokningar/journal hör till — slå ihop dem
  // istället för att försöka sätta samma telefonnummer på två rader (skulle
  // krocka med customers.phone:s unika index).
  const { data: accountRow } = await admin
    .from("customers")
    .select("id, email, phone")
    .eq("linked_user_id", userId)
    .maybeSingle();

  if (accountRow && accountRow.phone !== phone) {
    const { error: mergeError } = await upsertCustomerFields(admin, phone, {
      name: customerName,
      linked_user_id: userId,
      ...(accountRow.email ? { email: accountRow.email } : {}),
    });
    if (mergeError) {
      console.error("linkCustomerLogin — kunde inte slå ihop kundraderna:", mergeError);
      return { ok: false, error: "Kunde inte koppla inlogget." };
    }
    if (accountRow.phone === null) {
      await admin.from("customers").delete().eq("id", accountRow.id);
    }
    revalidatePath(`/coaching/kunder/${phone}`);
    revalidatePath("/coaching");
    return { ok: true };
  }

  const { error } = await upsertCustomerFields(admin, phone, {
    name: customerName,
    linked_user_id: userId,
  });

  if (error) {
    console.error("linkCustomerLogin — kunde inte koppla:", error);
    return { ok: false, error: "Kunde inte koppla inlogget." };
  }

  revalidatePath(`/coaching/kunder/${phone}`);
  revalidatePath("/coaching");
  return { ok: true };
}

// Fyller i telefonnummer på en kund som bara har ett konto (e-postkopplad
// kundrad utan telefon, se migration 0077) — t.ex. när personen ringer in
// eller bokar för första gången. Matchar på linked_user_id, inte telefon
// (som ju saknas), så kan inte träffa fel rad.
export async function setCustomerPhone(
  userId: string,
  phone: string,
): Promise<{ ok: boolean; error?: string; phone?: string }> {
  await requireCoach();

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return { ok: false, error: "Ogiltigt telefonnummer." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("customers")
    .update({ phone: normalizedPhone })
    .eq("linked_user_id", userId);

  if (error) {
    console.error("setCustomerPhone — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara telefonnumret (kanske redan använt av en annan kund)." };
  }

  revalidatePath(`/coaching/kunder/${normalizedPhone}`);
  revalidatePath("/coaching/kunder");
  return { ok: true, phone: normalizedPhone };
}

export async function unlinkCustomerLogin(phone: string): Promise<{ ok: boolean }> {
  await requireCoach();

  const admin = createAdminClient();
  const { error } = await admin
    .from("customers")
    .update({ linked_user_id: null })
    .eq("phone", phone);

  if (error) {
    console.error("unlinkCustomerLogin — kunde inte ta bort koppling:", error);
    return { ok: false };
  }

  revalidatePath(`/coaching/kunder/${phone}`);
  revalidatePath("/coaching");
  return { ok: true };
}
