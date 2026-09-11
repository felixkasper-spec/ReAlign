"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  COACHING_JOURNAL_BUCKET,
  MAX_JOURNAL_ATTACHMENT_BYTES,
  journalAttachmentTypeFromMime,
} from "@/lib/coaching-journal";

export async function addJournalEntry(userId: string, formData: FormData) {
  await requireCoach();

  const body = String(formData.get("body") ?? "").trim();
  const attachmentPath = formData.get("attachment_path");
  const attachmentType = formData.get("attachment_type");

  if (!body && !attachmentPath) {
    return;
  }

  const admin = createAdminClient();

  await admin.from("coaching_journal_entries").insert({
    user_id: userId,
    body: body || null,
    attachment_path: attachmentPath ? String(attachmentPath) : null,
    attachment_type: attachmentType ? String(attachmentType) : null,
  });

  revalidatePath(`/coaching/${userId}/journal`);
}

export async function createJournalAttachmentUploadUrl(
  userId: string,
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

  const admin = createAdminClient();
  const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await admin.storage
    .from(COACHING_JOURNAL_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error("Kunde inte förbereda uppladdningen.");
  }

  return { path, token: data.token, type };
}

export async function deleteJournalEntry(userId: string, entryId: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin
    .from("coaching_journal_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  revalidatePath(`/coaching/${userId}/journal`);
}
