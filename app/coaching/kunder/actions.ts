"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  COACHING_JOURNAL_BUCKET,
  MAX_JOURNAL_ATTACHMENT_BYTES,
  journalAttachmentTypeFromMime,
} from "@/lib/coaching-journal";

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
