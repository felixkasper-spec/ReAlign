"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const [{ data: profile }, { data: messages }, { data: journalEntries }] =
    await Promise.all([
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

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      output_config: { effort: "medium" },
      system: `Du är assistent åt en Postural Terapeut på Cleer Klinik som via chatt coachar Premium Coaching-kunder i deras posturala träningsprogram. Din uppgift är att föreslå ETT utkast till svar på kundens senaste meddelande, i terapeutens röst — varmt, professionellt, konkret, på svenska.

Terapeuten läser alltid igenom och redigerar utkastet innan det skickas, så var hellre lite försiktig med starka medicinska påståenden eller definitiva diagnoser än övertygande men fel. Om något i meddelandet tyder på akuta eller allvarliga symptom, uppmana kunden att söka vård istället för att bara ge träningsråd.

Svara ENDAST med själva utkastet till meddelande — ingen inledning, inga citattecken, ingen kommentar om att det är ett utkast.`,
      messages: [
        {
          role: "user",
          content: `Konversation med ${displayName} (senaste meddelandet sist):\n\n${transcript}${
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

export async function markContactMessageRead(messageId: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin
    .from("contact_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId);

  revalidatePath("/coaching");
}
