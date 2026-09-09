import "server-only";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER = { name: "ReAlign Metoden", email: "no-reply@realignmetoden.se" };

type EmailAddress = { email: string; name?: string };

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: EmailAddress[];
  subject: string;
  html: string;
  text: string;
  replyTo: EmailAddress;
}) {
  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: SENDER,
      to,
      replyTo,
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo send failed (${res.status}): ${await res.text()}`);
  }
}

export async function addToBrevoLeadList(email: string) {
  const listId = process.env.BREVO_LEAD_LIST_ID;
  if (!listId) {
    console.warn(
      "Newsletter opt-in requested but BREVO_LEAD_LIST_ID is not configured — skipping list add.",
    );
    return;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
        updateEnabled: true,
      }),
    });
    if (!res.ok) {
      console.error(`Brevo contact add failed (${res.status}): ${await res.text()}`);
    }
  } catch (e) {
    console.error("Failed to add contact to Brevo list", e);
  }
}
