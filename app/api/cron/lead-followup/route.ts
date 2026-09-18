import { createAdminClient } from "@/lib/supabase/admin";
import { notifyLeadFollowUpBatch } from "@/lib/pushover";

const DAY_MS = 24 * 60 * 60 * 1000;

// Körs en gång/dag (se vercel.json). Varje lead notifieras EXAKT en gång per
// steg (followup_2_sent_at / followup_3_sent_at), inte inom ett smalt
// dygns-fönster (t.ex. "daysSince >= 1 && < 2") — det smala fönstret kunde
// missa ett lead permanent om tidpunkten inte stämde exakt mot när cronen
// kör. Med en "redan skickad"-flagga istället för ett tidsfönster fångas
// leadet garanterat upp nästa gång cronen kör, oavsett exakt klockslag.
// Flaggorna nollställs när coachen loggar ett nytt samtalsförsök (se
// logCallAttempt i coaching/leads/actions.ts), så klockan räknas från
// senaste faktiska kontaktförsöket, inte från det första missade samtalet.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const { data: leads, error } = await admin
    .from("coaching_leads")
    .select("id, name, phone, status_updated_at, followup_2_sent_at, followup_3_sent_at")
    .eq("status", "no_answer");

  if (error) {
    console.error("Lead-followup cron query failed", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  const due: { name: string; phone: string; step: string }[] = [];
  const step2Ids: string[] = [];
  const step3Ids: string[] = [];

  for (const lead of leads ?? []) {
    const daysSince = (now - new Date(lead.status_updated_at).getTime()) / DAY_MS;

    if (daysSince >= 3 && !lead.followup_3_sent_at) {
      due.push({ name: lead.name, phone: lead.phone, step: "SMS 3 (sista försöket)" });
      step3Ids.push(lead.id);
    } else if (daysSince >= 1 && !lead.followup_2_sent_at) {
      due.push({ name: lead.name, phone: lead.phone, step: "SMS 2 (andra försöket)" });
      step2Ids.push(lead.id);
    }
  }

  await notifyLeadFollowUpBatch(due);

  const nowIso = new Date().toISOString();
  if (step2Ids.length > 0) {
    await admin
      .from("coaching_leads")
      .update({ followup_2_sent_at: nowIso })
      .in("id", step2Ids);
  }
  if (step3Ids.length > 0) {
    await admin
      .from("coaching_leads")
      .update({ followup_3_sent_at: nowIso })
      .in("id", step3Ids);
  }

  return Response.json({ sent: due.length });
}
