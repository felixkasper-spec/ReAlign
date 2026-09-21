import { createAdminClient } from "./supabase/admin";

export type LeadOwner = "felix" | "christopher";

export const LEAD_OWNER_LABELS: Record<LeadOwner, string> = {
  felix: "Felix",
  christopher: "Christopher",
};

// Läser den aktuella "vem kör annonsen just nu"-inställningen — stämplas
// på varje nytt lead vid inskick (se intresseanmalan/actions.ts). Faller
// tillbaka till "felix" om inställningsraden av någon anledning saknas,
// aldrig till ett trasigt/tomt värde.
export async function getCurrentLeadOwner(): Promise<LeadOwner> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("lead_owner_setting")
    .select("owner")
    .eq("id", 1)
    .maybeSingle();

  return (data?.owner as LeadOwner) ?? "felix";
}
