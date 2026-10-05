"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/brevo";
import { getBaseUrl } from "@/lib/base-url";

export async function replyToCoachingThread(
  userId: string,
  formData: FormData,
) {
  await requireCoach();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return;
  }

  const admin = createAdminClient();

  await admin.from("coaching_messages").insert({
    user_id: userId,
    sender: "coach",
    body,
  });

  await admin
    .from("coaching_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("sender", "user")
    .is("read_at", null);

  revalidatePath(`/coaching/${userId}`);
  revalidatePath("/coaching");

  // Mejlar kunden att ett nytt meddelande väntar — innehållet själv visas
  // bara i chatten (inte i mejlet), dels för att hälsorelaterat innehåll
  // inte ska ligga i inkorgen i klartext, dels för att mejlet inte ska
  // behöva uppdateras om coachen redigerar/skickar fler meddelanden i rad.
  const { data: profile } = await admin
    .from("profiles")
    .select("email, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.email) {
    const baseUrl = await getBaseUrl();
    const chatUrl = `${baseUrl}/min-sida/coaching`;
    try {
      await sendEmail({
        to: [{ email: profile.email, name: profile.display_name ?? undefined }],
        subject: "Nytt meddelande från din coach — ReAlign Metoden",
        replyTo: { email: "kontakt@realignmetoden.se", name: "ReAlign Metoden" },
        html: buildNewMessageEmailHtml(chatUrl),
        text: `Hej!\n\nDu har fått ett nytt meddelande från din coach på ReAlign Metoden. Logga in för att läsa och svara:\n${chatUrl}\n\nVänliga hälsningar,\nReAlign Metoden`,
      });
    } catch (e) {
      console.error("replyToCoachingThread — kunde inte skicka mejlnotis:", e);
    }
  }
}

function buildNewMessageEmailHtml(chatUrl: string) {
  return `
<div style="background:#fafaf7;padding:32px 16px;">
  <div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;border:1px solid #dadfd8;">
    <div style="margin-bottom:24px;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#5e7461;vertical-align:middle;margin-right:8px;"></span
      ><span style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#2b2e2a;vertical-align:middle;">ReAlign</span>
    </div>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2b2e2a;line-height:1.5;margin:0 0 24px;">
      Du har fått ett nytt meddelande från din coach.
    </p>
    <div style="text-align:center;margin:0 0 20px;">
      <a href="${chatUrl}" style="display:inline-block;background:#d98e5c;color:#2b2e2a;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:100px;">Läs och svara →</a>
    </div>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7267;line-height:1.5;margin:0;">
      Vänliga hälsningar,<br>ReAlign Metoden
    </p>
  </div>
</div>`;
}

export async function generateReplyDraft(
  userId: string,
): Promise<{ draft: string } | { error: string }> {
  await requireCoach();

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      error: "AI-förslag är inte konfigurerat (saknar ANTHROPIC_API_KEY).",
    };
  }

  const admin = createAdminClient();

  const [
    { data: profile },
    { data: messages },
    { data: journalEntries },
    { data: pastReplies },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("display_name, email")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("coaching_messages")
      .select("sender, body, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("coaching_journal_entries")
      .select("body, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    // Terapeutens egna tidigare skickade svar, oavsett kund — används som
    // stilreferens så förslagen gradvis låter mer som honom själv i takt
    // med att han skickar fler meddelanden. Ingen modellträning, bara
    // färska exempel i prompten varje gång.
    admin
      .from("coaching_messages")
      .select("body")
      .eq("sender", "coach")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const thread = (messages ?? []).slice().reverse();
  if (thread.length === 0) {
    return { error: "Inga meddelanden i tråden att utgå ifrån än." };
  }

  const displayName = profile?.display_name || profile?.email || "kunden";

  const transcript = thread
    .map((m) => `${m.sender === "coach" ? "Coach" : displayName}: ${m.body}`)
    .join("\n");

  const notes = (journalEntries ?? [])
    .filter((n) => n.body?.trim())
    .reverse()
    .map((n) => `- ${n.body}`)
    .join("\n");

  const styleExamples = (pastReplies ?? [])
    .filter((m) => m.body?.trim())
    .map((m) => `- ${m.body}`)
    .join("\n");

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      output_config: { effort: "medium" },
      system: `Du är assistent åt en Postural Terapeut på Cleer Klinik som via chatt coachar Premium Coaching-kunder i deras posturala träningsprogram. Din uppgift är att föreslå ETT utkast till svar på kundens senaste meddelande, i terapeutens röst — varmt, professionellt, konkret, på svenska.

Terapeuten läser alltid igenom och redigerar utkastet innan det skickas, så var hellre lite försiktig med starka medicinska påståenden eller definitiva diagnoser än övertygande men fel. Om något i meddelandet tyder på akuta eller allvarliga symptom, uppmana kunden att söka vård istället för att bara ge träningsråd.

Nedan finns exempel på meddelanden terapeuten själv skrivit tidigare (till olika kunder) — använd dem bara som referens för TON och STIL (ordval, meningslängd, hur formell/personlig han är), inte för sakinnehållet i dem.

Svara ENDAST med själva utkastet till meddelande — ingen inledning, inga citattecken, ingen kommentar om att det är ett utkast.`,
      messages: [
        {
          role: "user",
          content: `${
            styleExamples
              ? `Exempel på terapeutens egen skrivstil, från tidigare konversationer:\n${styleExamples}\n\n---\n\n`
              : ""
          }Konversation med ${displayName} (senaste meddelandet sist):\n\n${transcript}${
            notes
              ? `\n\nCoachens privata anteckningar om kunden (kunden ser inte dessa):\n${notes}`
              : ""
          }\n\nFöreslå ett svar på kundens senaste meddelande.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "Fick inget textsvar från AI:n, försök igen." };
    }

    return { draft: textBlock.text.trim() };
  } catch (e) {
    console.error("Failed to generate reply draft", e);
    return { error: "Kunde inte generera ett förslag just nu, försök igen." };
  }
}

// Sätter/rensar en kunds Drive-mapplänk (se migration 0073) — coachen
// skapar och delar mappen själv i sitt eget Drive-konto, det här bara
// lagrar och visar URL:en i chatten. Tomt värde rensar länken.
export async function updateCoachingDriveLink(userId: string, url: string) {
  await requireCoach();

  const trimmed = url.trim();
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ drive_folder_url: trimmed || null })
    .eq("id", userId);

  if (error) {
    console.error("updateCoachingDriveLink — kunde inte spara:", error);
    return { ok: false, error: "Kunde inte spara länken." };
  }

  revalidatePath(`/coaching/${userId}`);
  return { ok: true };
}

export async function markContactMessageRead(messageId: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin
    .from("contact_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId);

  revalidatePath("/coaching");
}
