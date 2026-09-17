import { createAdminClient } from "@/lib/supabase/admin";
import { notifyLeadFollowUpBatch } from "@/lib/pushover";

const DAY_MS = 24 * 60 * 60 * 1000;

// Körs en gång/dag (se vercel.json) på en förnuftig tid på dygnet — det är
// medvetet varför detta inte är en löpande koll: en enda daglig körning kan
// aldrig skicka en notis mitt i natten. Varje tröskel (1 dygn, 3 dygn) har
// ett ~24h-fönster den är sann inom, så en daglig körning ger i praktiken en
// notis per tröskel, inte en varje dag leadet ligger kvar. Alla leads som är
// mogna samma dag samlas i EN sammanfattande notis (notifyLeadFollowUpBatch)
// istället för en notis styck.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const { data: leads, error } = await admin
    .from("coaching_leads")
    .select("id, name, phone, status_updated_at")
    .eq("status", "no_answer");

  if (error) {
    console.error("Lead-followup cron query failed", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  const due: { name: string; phone: string; step: string }[] = [];

  for (const lead of leads ?? []) {
    const daysSince = (now - new Date(lead.status_updated_at).getTime()) / DAY_MS;

    let step: string | null = null;
    if (daysSince >= 3 && daysSince < 4) step = "SMS 3 (sista försöket)";
    else if (daysSince >= 1 && daysSince < 2) step = "SMS 2 (andra försöket)";

    if (step) due.push({ name: lead.name, phone: lead.phone, step });
  }

  await notifyLeadFollowUpBatch(due);

  return Response.json({ sent: due.length });
}
