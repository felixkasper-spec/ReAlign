"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";

const LEAD_STATUSES = [
  "no_answer",
  "not_interested",
  "purchased",
  "follow_up",
] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

export async function updateLeadStatus(leadId: string, status: string | null) {
  await requireCoach();

  if (status !== null && !LEAD_STATUSES.includes(status as LeadStatus)) {
    return;
  }

  const admin = createAdminClient();
  await admin.from("coaching_leads").update({ status }).eq("id", leadId);

  revalidatePath("/coaching/leads");
}

export async function updateLeadNotes(leadId: string, notes: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin
    .from("coaching_leads")
    .update({ notes: notes.trim() || null })
    .eq("id", leadId);

  revalidatePath("/coaching/leads");
}

export async function deleteLead(leadId: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin.from("coaching_leads").delete().eq("id", leadId);

  revalidatePath("/coaching/leads");
}
