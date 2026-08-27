import "server-only";
import { sendEmail } from "@/lib/brevo";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import type { NewsletterRecipient } from "@/lib/newsletter-recipients";

/**
 * Skickar ett godkänt utkast (veckobrev eller icke-Premium-mejl) till en
 * mottagarlista, en och en, med personlig avprenumereringslänk per
 * mottagare. Body byggs via callbacks eftersom unsubscribe-länken skiljer
 * sig per mottagare — går inte att skicka samma HTML/text till alla.
 */
export async function sendNewsletter({
  recipients,
  baseUrl,
  subject,
  buildHtml,
  buildText,
}: {
  recipients: NewsletterRecipient[];
  baseUrl: string;
  subject: string;
  buildHtml: (unsubscribeLink: string, name: string) => string;
  buildText: (unsubscribeLink: string, name: string) => string;
}) {
  let sent = 0;
  const errors: { userId: string; message: string }[] = [];

  for (const recipient of recipients) {
    const unsubscribeLink = unsubscribeUrl(baseUrl, recipient.id);
    try {
      await sendEmail({
        to: [{ email: recipient.email, ...(recipient.name ? { name: recipient.name } : {}) }],
        subject,
        replyTo: { email: "kontakt@realignmetoden.se", name: "ReAlign Metoden" },
        html: buildHtml(unsubscribeLink, recipient.name),
        text: buildText(unsubscribeLink, recipient.name),
      });
      sent++;
    } catch (e) {
      errors.push({ userId: recipient.id, message: (e as Error).message });
    }
  }

  return { sent, errors };
}
