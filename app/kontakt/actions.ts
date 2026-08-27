"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/brevo";

const ADMIN_EMAIL = "kontakt@realignmetoden.se";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendContactMessage(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { ok: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (!error) {
    await notifyContactMessage({ name, email, message });
  }

  return { ok: !error };
}

async function notifyContactMessage({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const results = await Promise.allSettled([
    sendEmail({
      to: [{ email, name }],
      subject: "Tack för ditt meddelande — ReAlign Metoden",
      replyTo: { email: ADMIN_EMAIL, name: "ReAlign Metoden" },
      html: `<p>Hej ${safeName},</p><p>Tack för ditt meddelande! Vi återkommer så snart vi kan, till den här mejladressen.</p><p>Ditt meddelande:</p><blockquote>${safeMessage}</blockquote><p>Vänliga hälsningar,<br>ReAlign Metoden</p>`,
      text: `Hej ${name},\n\nTack för ditt meddelande! Vi återkommer så snart vi kan, till den här mejladressen.\n\nDitt meddelande:\n${message}\n\nVänliga hälsningar,\nReAlign Metoden`,
    }),
    sendEmail({
      to: [{ email: ADMIN_EMAIL, name: "ReAlign Metoden" }],
      subject: `Nytt kontaktmeddelande från ${name}`,
      replyTo: { email, name },
      html: `<p><b>Namn:</b> ${safeName}</p><p><b>E-post:</b> ${escapeHtml(email)}</p><p><b>Meddelande:</b></p><blockquote>${safeMessage}</blockquote>`,
      text: `Namn: ${name}\nE-post: ${email}\n\nMeddelande:\n${message}`,
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Failed to send contact-form email", result.reason);
    }
  }
}
