import { createHash } from "crypto";

const LEAD_EVENT_SOURCE_URL = "https://www.realignmetoden.se/coaching-anmalan";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Server-till-server konverteringsspårning för leadformuläret på
// /coaching-anmalan. Sidan har medvetet ingen cookiebanner (se
// components/CookieConsent.tsx) — inga cookies sätts i besökarens
// webbläsare, så det finns inget samtycke att be om. Istället skickas ett
// hashat Lead-event direkt från servern till Meta när formuläret skickas in.
// Inaktiv (no-op) tills META_CONVERSIONS_API_TOKEN + META_PIXEL_ID är satta
// — dvs tills annonserna faktiskt sätts på.
export async function trackLeadConversion(lead: {
  phone: string;
  email?: string | null;
}) {
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  const pixelId = process.env.META_PIXEL_ID;
  if (!token || !pixelId) return;

  try {
    const userData: Record<string, string[]> = {
      ph: [sha256(lead.phone.replace(/\D/g, ""))],
    };
    if (lead.email) {
      userData.em = [sha256(lead.email)];
    }

    await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_source_url: LEAD_EVENT_SOURCE_URL,
              user_data: userData,
            },
          ],
        }),
      },
    );
  } catch {
    // Bästa-försök — ett misslyckat spårningsanrop ska aldrig påverka
    // leadinskickningen.
  }
}
