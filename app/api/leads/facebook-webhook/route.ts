import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyNewLead } from "@/lib/pushover";
import { getCurrentLeadOwner } from "@/lib/lead-owner";

// Tar emot Metas egen realtids-webhook för Lead Ads ("leadgen") direkt från
// Facebook — till skillnad från app/api/leads/meta/route.ts (byggd för en
// Zapier/Make-brygga som pollade med fördröjning) kommer leadsen in inom
// några sekunder. Samma mönster som Cleer Kliniks motsvarande webhook.
// Konfigureras under Meta-appens "Capture & manage ad leads"-användningsfall
// → Webhooks, se .env.example för de tre hemligheter som krävs.
const GRAPH_API_VERSION = "v21.0";

// Metas verifieringshandskakning — körs en gång när webhooken sparas i
// Meta-appens gränssnitt, och ibland igen om prenumerationen görs om.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Meta signerar varje POST-anrop med App Secret (HMAC-SHA256 av hela
// bodyn) — utan den kollen skulle vem som helst som gissar URL:en kunna
// posta påhittade leads rakt in i coaching_leads.
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

type LeadgenChange = {
  field: string;
  value: {
    leadgen_id: string;
    page_id: string;
    form_id: string;
    ad_id?: string;
    created_time: number;
  };
};

// Webhook-eventet innehåller bara ett leadgen_id, inte själva svaren —
// de måste hämtas separat via Graph API med en Page Access Token som har
// leads_retrieval-rättigheten.
async function fetchLeadFields(
  leadgenId: string,
): Promise<{ name?: string; phone?: string; email?: string; extra?: string } | null> {
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    console.error("Meta leadgen-webhook — META_PAGE_ACCESS_TOKEN saknas");
    return null;
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}?access_token=${pageAccessToken}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Meta leadgen-webhook — kunde inte hämta leadet:", await res.text());
    return null;
  }

  const data = await res.json();
  const fieldData: { name: string; values: string[] }[] = data.field_data ?? [];
  // Formulären använder ofta egna frågor istället för Metas standardfält —
  // Meta ger då fältet en nyckel baserad på frågetexten snarare än ett fast
  // namn som "full_name". Substrängsmatchning på nyckelord istället för
  // exakt fältnamn, så det funkar oavsett exakt frasering.
  const findField = (keywords: string[]) =>
    fieldData.find((f) => keywords.some((kw) => f.name.toLowerCase().includes(kw)));

  const nameField = findField(["full_name", "namn"]);
  const phoneField = findField(["phone_number", "telefon", "mobil"]);
  const emailField = findField(["email", "e-post", "e_post", "epost", "mejl", "mail"]);
  // En eventuell extra kvalificeringsfråga utöver namn/telefon/e-post — vi
  // vet inte i förväg exakt vilken fråga som läggs till i formuläret, så vi
  // tar svaret på det första fältet som inte redan matchat ett standardfält.
  const matched = new Set([nameField, phoneField, emailField].filter(Boolean));
  const extraField = fieldData.find((f) => !matched.has(f));
  // "Tillåt flera svar" på en flervalsfråga gör att Meta skickar flera
  // värden i samma fälts values-array — join istället för att bara ta [0],
  // annars tappas tyst alla val utom det första.
  const joinValues = (f?: { values: string[] }) => f?.values?.map((v) => v.trim()).join(", ") || undefined;

  return {
    name: joinValues(nameField),
    phone: joinValues(phoneField),
    email: joinValues(emailField),
    extra: joinValues(extraField),
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!isValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    // Utan denna logg är ett fel/saknat META_APP_SECRET omöjligt att skilja
    // från att webhooken aldrig nåddes alls — båda ser ut som "inget i
    // loggarna".
    console.log("Meta leadgen-webhook — avvisade anrop, signaturen matchar inte META_APP_SECRET");
    return new Response("Unauthorized", { status: 401 });
  }

  const body = JSON.parse(rawBody);
  if (body.object !== "page") {
    console.log(`Meta leadgen-webhook — ignorerar event, body.object = "${body.object}"`);
    return Response.json({ ok: true });
  }

  const admin = createAdminClient();
  const owner = await getCurrentLeadOwner();

  for (const entry of body.entry ?? []) {
    for (const change of (entry.changes ?? []) as LeadgenChange[]) {
      if (change.field !== "leadgen") continue;

      const lead = await fetchLeadFields(change.value.leadgen_id);
      if (!lead?.name || !lead?.phone) {
        console.log(
          `Meta leadgen-webhook — hoppar över leadgen_id ${change.value.leadgen_id}, saknar namn/telefon:`,
          lead,
        );
        continue;
      }

      const situation = lead.extra || "Via Metas snabbformulär";

      const { error } = await admin.from("coaching_leads").insert({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || null,
        situation,
        utm_source: "meta",
        utm_medium: "lead_ad",
        utm_campaign: change.value.form_id,
        owner,
      });

      if (error) {
        console.error("Meta leadgen-webhook — kunde inte spara leadet:", error);
        continue;
      }

      await notifyNewLead({ name: lead.name, phone: lead.phone, situation });

      console.log(
        `Meta leadgen-webhook — sparade lead ${lead.name} (${lead.phone}) från formulär ${change.value.form_id}`,
      );
    }
  }

  // Meta tolkar allt annat än 200 som ett misslyckat leveransförsök och
  // gör om anropet — svarar alltid ok även om ett enskilt lead ovan
  // loggades som fel, annars skulle Meta bombardera endpointen med samma
  // trasiga event om och om igen.
  return Response.json({ ok: true });
}
