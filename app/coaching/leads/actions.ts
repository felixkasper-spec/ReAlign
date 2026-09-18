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
  await admin
    .from("coaching_leads")
    .update({
      status,
      status_updated_at: new Date().toISOString(),
      // Ny "no_answer"-cykel (första gången eller ett återöppnat lead) ska
      // starta om uppföljningsklockan — annars skulle gamla skickade-flaggor
      // kunna tysta en påminnelse som borde gå ut på nytt.
      ...(status === "no_answer"
        ? { followup_2_sent_at: null, followup_3_sent_at: null }
        : {}),
    })
    .eq("id", leadId);

  revalidatePath("/coaching/leads");
}

// Loggar att coachen faktiskt ringde IGEN utan att statusen ändras (den är
// redan "no_answer" sedan förra försöket) — annars finns inget sätt att
// registrera ett upprepat missat samtal, och uppföljningsklockan
// (status_updated_at) fastnar på det ALLRA FÖRSTA missade samtalet istället
// för det senaste. Rör bara leads som redan är "no_answer" (.eq nedan) så
// att detta aldrig av misstag skriver över en annan status.
export async function logCallAttempt(leadId: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin
    .from("coaching_leads")
    .update({
      status_updated_at: new Date().toISOString(),
      followup_2_sent_at: null,
      followup_3_sent_at: null,
    })
    .eq("id", leadId)
    .eq("status", "no_answer");

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
