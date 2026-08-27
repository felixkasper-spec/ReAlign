import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type NewsletterRecipient = {
  id: string;
  email: string;
  name: string;
};

async function activeSubscriberIds(): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, status")
    .in("status", ["active", "trialing"]);
  if (error) throw error;
  return new Set((data ?? []).map((s) => s.user_id as string));
}

async function marketingOptedInProfiles() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("marketing_emails", true);
  if (error) throw error;
  return data ?? [];
}

function toRecipient(p: { id: string; email: string; display_name: string | null }): NewsletterRecipient {
  return { id: p.id, email: p.email, name: p.display_name?.trim() || "" };
}

/** Gratiskonton (ingen aktiv prenumeration) som samtyckt till marknadsföringsmejl. */
export async function getNonPremiumRecipients(): Promise<NewsletterRecipient[]> {
  const [profiles, activeIds] = await Promise.all([
    marketingOptedInProfiles(),
    activeSubscriberIds(),
  ]);
  return profiles.filter((p) => !activeIds.has(p.id)).map(toRecipient);
}

/** Premium/Premium Coaching-medlemmar som samtyckt till marknadsföringsmejl. */
export async function getPremiumRecipients(): Promise<NewsletterRecipient[]> {
  const [profiles, activeIds] = await Promise.all([
    marketingOptedInProfiles(),
    activeSubscriberIds(),
  ]);
  return profiles.filter((p) => activeIds.has(p.id)).map(toRecipient);
}
