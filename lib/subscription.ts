import "server-only";
import { createClient } from "@/lib/supabase/server";

export type SubscriptionInfo = {
  active: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
};

/**
 * Hämtar den inloggade användarens prenumerationsstatus. Används för att
 * styra åtkomst till premiuminnehåll (Nivå 2+/Gym) när det innehållet
 * porteras in i databasen.
 */
export async function getSubscription(): Promise<SubscriptionInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { active: false, status: null, currentPeriodEnd: null };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const active = data?.status === "active" || data?.status === "trialing";

  return {
    active,
    status: data?.status ?? null,
    currentPeriodEnd: data?.current_period_end ?? null,
  };
}
