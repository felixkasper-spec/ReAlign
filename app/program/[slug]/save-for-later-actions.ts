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
      html: buildLinkEmailHtml(programTitle, url),
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

function buildLinkEmailHtml(programTitle: string, url: string) {
  return `
<div style="background:#fafaf7;padding:32px 16px;">
  <div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;border:1px solid #dadfd8;">
    <div style="margin-bottom:24px;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#5e7461;vertical-align:middle;margin-right:8px;"></span
      ><span style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#2b2e2a;vertical-align:middle;">ReAlign</span>
    </div>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2b2e2a;line-height:1.5;margin:0 0 16px;">Hej!</p>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2b2e2a;line-height:1.5;margin:0 0 24px;">
      Här är länken till <b>${programTitle}</b> som du ville testa senare:
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${url}" style="display:inline-block;background:#d98e5c;color:#2b2e2a;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:100px;">Öppna programmet →</a>
    </div>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7267;line-height:1.5;margin:0;">
      Vänliga hälsningar,<br>ReAlign Metoden
    </p>
  </div>
</div>`;
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
