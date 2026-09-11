"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";

export async function markLeadContacted(leadId: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin
    .from("coaching_leads")
    .update({ contacted_at: new Date().toISOString() })
    .eq("id", leadId);

  revalidatePath("/coaching/leads");
}
