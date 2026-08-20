import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role-klient som kringgår RLS. Får ALDRIG importeras i klientkod
 * eller i vanliga sidor/actions — bara i serverkod som Stripe-webhooken,
 * som måste kunna skriva prenumerationsstatus för godtycklig användare.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
