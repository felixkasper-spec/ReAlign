const PUSHOVER_API_URL = "https://api.pushover.net/1/messages.json";

// Push-notis till Felix telefon när ett nytt lead kommer in via
// /coaching-anmalan. Inaktiv (no-op) tills PUSHOVER_USER_KEY +
// PUSHOVER_API_TOKEN är satta.
export async function notifyNewLead(lead: {
  name: string;
  phone: string;
  situation?: string | null;
}) {
  const token = process.env.PUSHOVER_API_TOKEN;
  const userKey = process.env.PUSHOVER_USER_KEY;
  if (!token || !userKey) return;

  try {
    const res = await fetch(PUSHOVER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        user: userKey,
        title: "Ny intresseanmälan",
        message: `${lead.name} · ${lead.phone}${
          lead.situation ? `\n${lead.situation}` : ""
        }`,
        url: "https://www.realignmetoden.se/coaching/leads",
        url_title: "Öppna leads",
      }),
    });

    if (!res.ok) {
      console.error("Pushover-fel:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Pushover — nätverksfel:", err);
  }
}
