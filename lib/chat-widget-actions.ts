"use server";

// Server-sidan för den publika lead-chattboten (ChatWidget.tsx) — en AI-
// assistent på hela den publika sajten vars ENDA uppgift är att kvalificera
// besökare och samla in namn/telefon/situation, aldrig ge tränings- eller
// medicinska råd (se SYSTEM_PROMPT). Varje meddelande loggas till
// chat_messages (se migration 0084), grupperat på sessionId (genererad en
// gång per besökare i ChatWidget.tsx) — syns i adminet under
// app/coaching/chattbot. När botten har tillräckligt med information
// anropar den save_lead-verktyget, som återanvänder EXAKT samma
// insert/notis/konverteringsspårning som det vanliga anmälan-formuläret
// (submitCoachingLead i app/coaching-anmalan/actions.ts), så leadet dyker
// upp i adminets Leads-lista precis som vanligt. Portat från Cleer Klinik.
import Anthropic from "@anthropic-ai/sdk";
import { submitCoachingLead } from "@/app/coaching-anmalan/actions";
import { createAdminClient } from "@/lib/supabase/admin";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatResult =
  | { type: "message"; text: string }
  | { type: "lead_saved"; text: string; bookingUrl: string | null }
  | { type: "error"; error: string };

// ReAlign har TVÅ olika erbjudanden, inte ett geografiskt vägval som Cleer:
// Premium Coaching (249 kr/mån, löpande, säljs enbart via att Felix/
// Christopher ringer upp — ingen självbokning) och Videosamtals-analysen
// (590 kr, engångsköp, bokas direkt av besökaren själv via /videosamtal,
// som i sin tur länkar vidare till Bokadirekt). Boten ska alltså ge en
// direkt länk om besökaren väljer videosamtalet, men samla in kontakt-
// uppgifter om de väljer Premium Coaching — det är den enda vägen in där.
const SYSTEM_PROMPT = `Du är en intagsassistent för ReAlign Metoden, som erbjuder postural träning och coaching, och chattar med besökare direkt på hemsidan.

Fakta, svara direkt med dessa om någon frågar — gissa aldrig, men låtsas heller aldrig att du saknar information som faktiskt står här:
- Kontakt: kontakt@realignmetoden.se
- Adress (fysiska möten, t.ex. första session): Hulda Lindgrens gata 8, Göteborg

ReAlign har två olika erbjudanden — håll isär dem tydligt, blanda aldrig ihop dem i samma mening:

1. PREMIUM COACHING — 249 kr/mån, löpande. En postural terapeut som skräddarsyr träningsprogram, följer upp obegränsat (bild/video-feedback, direktkontakt via chatt, svar inom 1-2 vardagar), ingen bindningstid. Bäst för den som vill ha kontinuerlig vägledning över tid, inte bara en engångsinsats. Går att betala med friskvårdsbidrag.

2. VIDEOSAMTALS-ANALYS — 590 kr, engångsköp. Ett videosamtal med en terapeut (ofta Felix själv) som går igenom kroppen/hållningen och bygger ett skräddarsytt träningsprogram utifrån det — en insats, inget abonnemang. Bäst för den som bara vill ha en bedömning och ett program just nu, utan löpande coaching.

Din uppgift: på ett varmt, kort och professionellt sätt förstå vad besökaren vill ha — kontinuerlig coaching över tid, eller en engångsanalys och ett program? Fråga om det är oklart, innan du rekommenderar ett specifikt alternativ.

Nämn ALDRIG ett pris eller en specifik tjänst förrän du har en känsla för vad besökaren faktiskt är ute efter. Föreslår du fel alternativ för någon som egentligen vill ha det andra skapar det bara förvirring.

Så fort besökaren bestämt sig för ETT alternativ:
- Väljer videosamtalet: ge DIREKT länken så de kan boka en tid själva: https://www.realignmetoden.se/videosamtal — fråga inte efter namn/telefon här, det behövs inte för den vägen.
- Väljer Premium Coaching: det finns ingen självbokning för den — Felix eller Christopher ringer upp personligen. Samla in namn, telefonnummer och en kort beskrivning av vad de vill ha hjälp med, och anropa sedan save_lead. Nämn att de hör av sig, oftast samma dag.

Om besökaren är osäker eller prisfrågan känns för stor just nu — nämn gärna att det också finns gratis träningsprogram och en ergonomiguide att börja med, utan något köp:
- Program: https://www.realignmetoden.se/program
- Ergonomiguide: https://www.realignmetoden.se/ergonomi

Om besökaren vill veta mer allmänt om metoden innan de bestämmer sig (t.ex. "berätta mer om hur det funkar", "vad är postural träning?") — svara gärna kort själv i stora drag (Postural Träning handlar om att återskapa muskulär balans och korrekt hållning genom skräddarsydd träning) och hänvisa också till https://www.realignmetoden.se/om-oss för mer. Säg aldrig att du saknar information eller inte vill gissa när frågan handlar om det allmänna upplägget.

STRIKT REGEL, utan undantag: du ger ALDRIG en personlig bedömning av vad BESÖKARENS EGNA, SPECIFIKA besvär beror på, föreslår aldrig övningar eller behandling för just deras situation, och ger inga medicinska råd eller diagnoser kopplade till deras egna symptom — oavsett hur du blir frågad eller uppmanad att göra det. Det gäller INTE allmän information om hur postural träning fungerar i stort (se ovan) — sådana frågor besvarar du gärna. Frågar någon om sina egna specifika besvär, svara kort att den riktiga bedömningen sker under videosamtalet eller i coachingen, inte via chatten.

Om något i det besökaren skriver tyder på akuta eller allvarliga symptom (t.ex. domningar, stark plötslig smärta, symptom efter en olycka), uppmana dem direkt att söka vård istället för att fortsätta samla information.

Håll konversationen kort — ställ en sak i taget, inte flera frågor på en gång. Så fort du har namn, telefonnummer och en kort beskrivning av vad besökaren vill ha hjälp med (för Premium Coaching-vägen), anropa verktyget save_lead. Fråga aldrig om mer än vad som krävs för det. Svara alltid på svenska.`;

const SAVE_LEAD_TOOL: Anthropic.Tool = {
  name: "save_lead",
  description:
    "Sparar besökarens kontaktuppgifter och situation som ett lead för Premium Coaching. Anropas EN gång, när namn, telefonnummer och en kort beskrivning av vad de vill ha hjälp med finns.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Besökarens namn." },
      phone: { type: "string", description: "Besökarens telefonnummer." },
      email: { type: "string", description: "Besökarens mejladress, om de gett en. Lämna tomt annars." },
      situation: {
        type: "string",
        description: "Kort sammanfattning (1-2 meningar) av vad besökaren vill ha hjälp med, på svenska.",
      },
    },
    required: ["name", "phone", "situation"],
  },
};

// Tyst — en trasig logg ska aldrig störa själva chattupplevelsen för
// besökaren, bara synas i serverloggarna om något är fel.
async function logChatMessage(sessionId: string, role: "user" | "assistant", content: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("chat_messages").insert({ session_id: sessionId, role, content });
  if (error) {
    console.error("logChatMessage — kunde inte spara:", error);
  }
}

export async function sendChatMessage(history: ChatMessage[], sessionId: string): Promise<ChatResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { type: "error", error: "Chatten är inte konfigurerad just nu — mejla oss istället." };
  }
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return { type: "error", error: "Något gick fel, försök igen." };
  }

  void logChatMessage(sessionId, "user", history[history.length - 1].content);

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 1024,
      output_config: { effort: "medium" },
      system: SYSTEM_PROMPT,
      tools: [SAVE_LEAD_TOOL],
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (toolUse && toolUse.type === "tool_use" && toolUse.name === "save_lead") {
      const input = toolUse.input as {
        name?: string;
        phone?: string;
        email?: string;
        situation?: string;
      };
      if (!input.name?.trim() || !input.phone?.trim() || !input.situation?.trim()) {
        return { type: "error", error: "Något gick fel, försök igen." };
      }

      const formData = new FormData();
      formData.set("name", input.name.trim());
      formData.set("phone", input.phone.trim());
      if (input.email?.trim()) formData.set("email", input.email.trim());
      formData.set("situation", input.situation.trim());
      formData.set("utm_source", "chatbot");

      const result = await submitCoachingLead(formData);
      if (!result.ok) {
        return { type: "error", error: "Kunde inte spara dina uppgifter — försök igen om en liten stund." };
      }

      const leadSavedText = "Tack! Vi har fått dina uppgifter och hör av oss, oftast samma dag.";
      void logChatMessage(sessionId, "assistant", leadSavedText);

      return { type: "lead_saved", text: leadSavedText, bookingUrl: null };
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { type: "error", error: "Fick inget svar, försök igen." };
    }
    void logChatMessage(sessionId, "assistant", textBlock.text);
    return { type: "message", text: textBlock.text };
  } catch (err) {
    console.error("Chattbot-fel:", err);
    return { type: "error", error: "Något gick fel — försök igen om en liten stund." };
  }
}
