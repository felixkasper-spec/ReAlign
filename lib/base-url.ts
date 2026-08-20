import "server-only";
import { headers } from "next/headers";

/**
 * Bygger sajtens bas-URL för redirect-länkar (Stripe success/cancel-URL:er,
 * Supabase e-postbekräftelselänkar m.m.). `Origin`-headern skickas inte
 * alltid med av alla proxyer/CDN:er, så vi faller tillbaka på `Host`
 * (som alltid finns enligt HTTP-spec).
 */
export async function getBaseUrl() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;

  const host = h.get("host");
  if (host) {
    const protocol = host.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}
