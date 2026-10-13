import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";

// Supabase-js' .upsert() med ett enda objekt (inte en array) skriver vid
// konflikt om ALLA kolumner i tabellen, inte bara de som finns med i
// objektet — kolumner som utelämnas blir null/default istället för att
// lämnas orörda (känt, oåtgärdat problem i supabase-js, se
// https://github.com/supabase/supabase-js/pull/1912). customers-tabellen
// har flera oberoende fält (linked_user_id, email, name) som sätts av helt
// olika delar av admin-verktyget vid olika tillfällen — ett upsert som bara
// skickar t.ex. {phone, name, email} nollställer då i praktiken
// linked_user_id varje gång en bokning skapas/rättas för en redan
// kontokopplad kund, vilket tyst river kopplingen.
//
// Säkert mönster istället: uppdatera först (update rör bara de angivna
// kolumnerna, oavsett hur många eller få de är) — skapa raden bara om
// uppdateringen inte träffade någon (kunden fanns inte sedan innan).
export async function upsertCustomerFields(
  admin: ReturnType<typeof createAdminClient>,
  phone: string,
  fields: Record<string, unknown>,
): Promise<{ error: unknown }> {
  const { data, error: updateError } = await admin
    .from("customers")
    .update(fields)
    .eq("phone", phone)
    .select("phone");

  if (updateError) return { error: updateError };
  if (data && data.length > 0) return { error: null };

  const { error: insertError } = await admin.from("customers").insert({ phone, ...fields });
  return { error: insertError };
}
