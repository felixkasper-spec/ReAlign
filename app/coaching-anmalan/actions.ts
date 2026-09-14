"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { trackLeadConversion } from "@/lib/server-conversion";
import { notifyNewLead } from "@/lib/pushover";

export async function submitCoachingLead(
  formData: FormData,
): Promise<{ ok: boolean }> {
  // Honeypot — osynligt fält som bara bottar fyller i. Låtsas att det gick
  // bra utan att spara eller skicka något vidare.
  if ((formData.get("website") as string)?.trim()) {
    return { ok: true };
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const situation = (formData.get("situation") as string)?.trim();
  const fbclid = (formData.get("fbclid") as string)?.trim();
  const utmSource = (formData.get("utm_source") as string)?.trim();
  const utmMedium = (formData.get("utm_medium") as string)?.trim();
  const utmCampaign = (formData.get("utm_campaign") as string)?.trim();

  if (!name || !phone || !situation) {
    return { ok: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("coaching_leads").insert({
    name,
    phone,
    email: email || null,
    situation,
    utm_source: utmSource || null,
    utm_medium: utmMedium || null,
    utm_campaign: utmCampaign || null,
  });

  if (!error) {
    const h = await headers();
    const clientIp = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = h.get("user-agent");
    await trackLeadConversion({ phone, email, fbclid, clientIp, userAgent });
    await notifyNewLead({ name, phone, situation });
  }

  return { ok: !error };
}
