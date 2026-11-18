import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// TEMPORÄR bro till Cleer Kliniks separata Supabase-projekt — speglar
// Meta-leadgen-webhookarnas leads dit också (se api/leads/meta/route.ts och
// api/leads/facebook-webhook/route.ts) så Felix/Christopher kan hantera
// allt från Cleers leads-admin under tiden. Returnerar null om nycklarna
// saknas istället för att kasta, så webhookarna aldrig går sönder bara för
// att den här temporära speglingen inte är konfigurerad.
export function createCleerAdminClient() {
  const url = process.env.CLEER_SUPABASE_URL;
  const key = process.env.CLEER_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
