"use server";

import { sendEmail } from "@/lib/brevo";

const SITE_URL = "https://www.realignmetoden.se";
const BREVO_LEAD_LIST_ID = process.env.BREVO_LEAD_LIST_ID;

export async function sendSaveForLaterLink(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const programSlug = (formData.get("programSlug") as string)?.trim();
  const programTitle = (formData.get("programTitle") as string)?.trim();
  const wantsNewsletter = formData.get("newsletter") === "on";

  if (!email || !email.includes("@") || !programSlug || !programTitle) {
    return { ok: false };
  }

  const url = `${SITE_URL}/program/${programSlug}`;

  try {
    await sendEmail({
      to: [{ email }],
      subject: `Din länk till ${programTitle} — ReAlign Metoden`,
      replyTo: { email: "kontakt@realignmetoden.se", name: "ReAlign Metoden" },
      html: `<p>Hej!</p><p>Här är länken till ${programTitle} som du ville testa senare:</p><p><a href="${url}">${url}</a></p><p>Vänliga hälsningar,<br>ReAlign Metoden</p>`,
      text: `Hej!\n\nHär är länken till ${programTitle} som du ville testa senare:\n${url}\n\nVänliga hälsningar,\nReAlign Metoden`,
    });
  } catch (e) {
    console.error("Failed to send save-for-later link", e);
    return { ok: false };
  }

  if (wantsNewsletter) {
    await addToBrevoLeadList(email);
  }

  return { ok: true };
}

async function addToBrevoLeadList(email: string) {
  if (!BREVO_LEAD_LIST_ID) {
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
        listIds: [Number(BREVO_LEAD_LIST_ID)],
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
