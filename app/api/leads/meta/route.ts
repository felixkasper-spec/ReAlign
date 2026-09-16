import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewLead } from "@/lib/pushover";

// Tar emot leads från Metas inbyggda "Snabba formulär" (Instant Form/Lead
// Ads) — de annonserna länkar aldrig till hemsidan, så vårt vanliga
// leadformulär (/coaching-anmalan, actions.ts) triggas aldrig av dem. Metas
// leads hamnar bara i deras eget Leads Center om inget kopplar vidare dem.
// Den bron är tänkt att vara en Zapier/Make-automation: "New Lead in
// Facebook Lead Ads" → POST hit med formulärsvaren, se .env.example för
// hemligheten som skyddar denna endpoint.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.META_LEAD_WEBHOOK_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = (body?.name as string)?.trim();
  const phone = (body?.phone as string)?.trim();
  const email = (body?.email as string)?.trim();
  const formName = (body?.formName as string)?.trim();

  if (!name || !phone) {
    return Response.json({ ok: false, error: "name och phone krävs" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("coaching_leads").insert({
    name,
    phone,
    email: email || null,
    situation: formName ? `Via Metas snabbformulär: ${formName}` : "Via Metas snabbformulär",
    utm_source: "meta",
    utm_medium: "lead_ad",
    utm_campaign: formName || null,
  });

  if (error) {
    console.error("Meta lead-webhook — kunde inte spara leadet:", error);
    return Response.json({ ok: false }, { status: 500 });
  }

  await notifyNewLead({
    name,
    phone,
    situation: formName ? `Snabbformulär: ${formName}` : "Snabbformulär (Meta)",
  });

  return Response.json({ ok: true });
}
