"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitCoachingLead(
  formData: FormData,
): Promise<{ ok: boolean }> {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const situation = (formData.get("situation") as string)?.trim();

  if (!name || !phone || !situation) {
    return { ok: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("coaching_leads").insert({
    name,
    phone,
    email: email || null,
    situation,
  });

  return { ok: !error };
}
