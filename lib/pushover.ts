const PUSHOVER_API_URL = "https://api.pushover.net/1/messages.json";

async function sendPushover(payload: {
  title: string;
  message: string;
  url: string;
  url_title: string;
}) {
  const token = process.env.PUSHOVER_API_TOKEN;
  const userKey = process.env.PUSHOVER_USER_KEY;
  if (!token || !userKey) return;

  try {
    const res = await fetch(PUSHOVER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, user: userKey, ...payload }),
    });

    if (!res.ok) {
      console.error("Pushover-fel:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Pushover — nätverksfel:", err);
  }
}

// Push-notis till Felix telefon när ett nytt lead kommer in via
// /coaching-anmalan. Inaktiv (no-op) tills PUSHOVER_USER_KEY +
// PUSHOVER_API_TOKEN är satta.
export async function notifyNewLead(lead: {
  name: string;
  phone: string;
  situation?: string | null;
}) {
  await sendPushover({
    title: "Ny intresseanmälan",
    message: `${lead.name} · ${lead.phone}${lead.situation ? `\n${lead.situation}` : ""}`,
    url: "https://www.realignmetoden.se/coaching/leads",
    url_title: "Öppna leads",
  });
}

// Push-notis när ett "Inget svar"-lead är moget för nästa steg i
// uppföljningskadensen (se lib/lead-followup.ts + api/cron/lead-followup).
export async function notifyLeadFollowUp(lead: { name: string; phone: string; step: string }) {
  await sendPushover({
    title: `Dags att följa upp: ${lead.step}`,
    message: `${lead.name} · ${lead.phone}\nHar inte svarat — dags för nästa steg i uppföljningen.`,
    url: "https://www.realignmetoden.se/coaching/leads?status=no_answer",
    url_title: "Öppna leads",
  });
}
