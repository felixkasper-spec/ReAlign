"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LeadOwner } from "@/lib/lead-owner";

const LEAD_STATUSES = [
  "no_answer",
  "not_interested",
  "purchased",
  "follow_up",
] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

const LEAD_OWNERS = ["felix", "christopher"] as const;

// Returnerar {ok:false} istället för att bara svälja fel — LeadControls
// pekar annars själva statusen som "sparad" (optimistisk UI) utan att
// kunna veta att skrivningen faktiskt misslyckades (t.ex. nätverksfel på
// mobilt bygge med dåligt signal), så ändringen tyst försvinner tills nästa
// sidladdning visar den gamla statusen igen.
//
// Medvetet INTE requireCoach() här (som redirectar vid ogiltig session) —
// den funktionen anropas direkt från klientkoden (LeadControls, inte via
// ett formulär) inuti ett try/catch. En redirect() som kastas därifrån
// fångas tyst av catchen och visas som samma generiska "Kunde inte
// spara"-fel istället för att faktiskt navigera, vilket gömde den riktiga
// orsaken (utloggad/för gammal session) bakom ett missvisande meddelande.
export async function updateLeadStatus(
  leadId: string,
  status: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !process.env.COACH_EMAIL || user.email !== process.env.COACH_EMAIL) {
    return {
      ok: false,
      error: "Du verkar inte vara inloggad längre — ladda om sidan och logga in igen.",
    };
  }

  if (status !== null && !LEAD_STATUSES.includes(status as LeadStatus)) {
    return { ok: false, error: "Ogiltig status." };
  }

  const admin = createAdminClient();
  const { error } = await admin
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

  if (error) {
    console.error("updateLeadStatus — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara statusen, försök igen." };
  }

  revalidatePath("/coaching/leads");
  return { ok: true };
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

// Manuell rättning av vilket enskilt lead som tillhör vem — en säkerhetsventil
// ifall "vem kör annonsen just nu"-inställningen glömdes bort att växlas.
export async function updateLeadOwner(leadId: string, owner: string | null) {
  await requireCoach();

  if (owner !== null && !LEAD_OWNERS.includes(owner as LeadOwner)) {
    return;
  }

  const admin = createAdminClient();
  await admin.from("coaching_leads").update({ owner }).eq("id", leadId);

  revalidatePath("/coaching/leads");
}

// "Vem kör annonsen just nu" — påverkar bara NYA leads framåt (se
// getCurrentLeadOwner i coaching-anmalan/actions.ts), rör aldrig redan
// sparade leads.
export async function setActiveLeadOwner(owner: string) {
  await requireCoach();

  if (!LEAD_OWNERS.includes(owner as LeadOwner)) return;

  const admin = createAdminClient();
  await admin
    .from("lead_owner_setting")
    .update({ owner, updated_at: new Date().toISOString() })
    .eq("id", 1);

  revalidatePath("/coaching/leads");
}

export async function deleteLead(leadId: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin.from("coaching_leads").delete().eq("id", leadId);

  revalidatePath("/coaching/leads");
}
