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
