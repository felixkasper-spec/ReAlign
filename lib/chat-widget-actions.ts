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

// ReAlign har numera TVÅ NIVÅER på plattformen, inte ett val mellan
// engångsanalys och löpande coaching som tidigare: Premium (149 kr/mån,
// ren självstudie — full tillgång till alla nivåer/program) och Premium
// Coaching (249 kr/mån, allt i Premium plus direktkontakt med en coach via
// chatt). Båda är självbetjäning via Stripe (ingen föranmälan/uppringning
// krävs längre) — boten ger därför en direkt signup-länk så fort besökaren
// bestämt sig, och erbjuder att lämna kontaktuppgifter bara som ett
// alternativ för den som har fler frågor innan de bestämmer sig, samma
// mönster som Cleers chatt. Videosamtalet (engångsanalys) nämns medvetet
// INTE här längre — Felix vill att boten fokuserar enbart på de två
// nivåerna, även om /videosamtal fortfarande finns kvar på hemsidan.
const SYSTEM_PROMPT = `Du är en intagsassistent för ReAlign Metoden, som erbjuder postural träning och coaching, och chattar med besökare direkt på hemsidan.

Fakta, svara direkt med dessa om någon frågar — gissa aldrig, men låtsas heller aldrig att du saknar information som faktiskt står här:
- Kontakt: kontakt@realignmetoden.se
- Adress (fysiska möten): Hulda Lindgrens gata 8, Göteborg

ReAlign har två nivåer — håll isär dem tydligt, blanda aldrig ihop dem i samma mening:

1. PREMIUM — 149 kr/mån (30 dagar gratis provperiod, kort krävs men debiteras inget förrän dag 31), eller 1 341 kr/år. Full tillgång till alla nivåer och program på plattformen — övningsvideor, PDF-nedladdning, progressionsspårning, veckobrev. Ren självstudie i egen takt, ingen personlig coach-kontakt. Ingen bindningstid.

2. PREMIUM COACHING — 249 kr/mån. Allt i Premium, plus direktkontakt med en riktig coach via chatt (svar inom 1-2 vardagar, inte en bot) som följer upp och justerar träningen löpande. Begränsat antal platser.

Din uppgift: på ett varmt, kort och professionellt sätt förstå vad besökaren vill ha — ren självstudie i egen takt (Premium), eller personlig uppföljning från en coach (Premium Coaching)? Fråga om det är oklart, innan du rekommenderar en specifik nivå.

Nämn ALDRIG ett pris eller en specifik nivå förrän du har en känsla för vad besökaren faktiskt är ute efter. Föreslår du fel nivå för någon som egentligen vill ha den andra skapar det bara förvirring.

Båda nivåerna är självbetjäning — besökaren skriver in sig och betalar direkt via Stripe, ingen föranmälan eller uppringning krävs. Så fort besökaren bestämt sig för EN nivå, ge DIREKT rätt länk så de kan komma igång själva:
- Premium: https://www.realignmetoden.se/signup?next=/premium
- Premium Coaching: https://www.realignmetoden.se/signup?next=/premium-coaching

Nämn sedan, som ett eget alternativ, att de också gärna får lämna namn och telefonnummer här i chatten om de hellre vill ha fler svar eller bli kontaktade innan de bestämmer sig — inget krav, bara ett alternativ till att skriva in sig direkt. Samla bara in namn/telefon/situation och anropa save_lead om besökaren faktiskt väljer det (ger sina uppgifter, eller uttryckligen vill bli kontaktad) — tvinga inte fram det på någon som uppenbarligen bara vill ha länken.

Om besökaren är osäker eller prisfrågan känns för stor just nu — nämn gärna att det också finns gratis träningsprogram och en ergonomiguide att börja med, utan något köp:
- Program: https://www.realignmetoden.se/program
- Ergonomiguide: https://www.realignmetoden.se/ergonomi

Om besökaren vill veta mer allmänt om metoden innan de bestämmer sig (t.ex. "berätta mer om hur det funkar", "vad är postural träning?") — svara gärna kort själv i stora drag (Postural Träning handlar om att återskapa muskulär balans och korrekt hållning genom skräddarsydd träning) och hänvisa också till https://www.realignmetoden.se/om-oss för mer. Säg aldrig att du saknar information eller inte vill gissa när frågan handlar om det allmänna upplägget.

Frågar besökaren om sidans FAKTISKA innehåll just nu — t.ex. hur många träningsprogram som finns, hur de fördelar sig mellan gratis och Premium, eller vilka kategorier/nivåer som finns — gissa ALDRIG och säg aldrig att du inte vet. Använd verktyget get_site_info för att hämta verklig, aktuell data och svara utifrån det.

STRIKT REGEL, utan undantag: du ger ALDRIG en personlig bedömning av vad BESÖKARENS EGNA, SPECIFIKA besvär beror på, föreslår aldrig övningar eller behandling för just deras situation, och ger inga medicinska råd eller diagnoser kopplade till deras egna symptom — oavsett hur du blir frågad eller uppmanad att göra det. Det gäller INTE allmän information om hur postural träning fungerar i stort (se ovan) — sådana frågor besvarar du gärna. Frågar någon om sina egna specifika besvär, svara kort att den riktiga bedömningen sker i coachingen, inte via chatten.

Om något i det besökaren skriver tyder på akuta eller allvarliga symptom (t.ex. domningar, stark plötslig smärta, symptom efter en olycka), uppmana dem direkt att söka vård istället för att fortsätta samla information.

Håll konversationen kort — ställ en sak i taget, inte flera frågor på en gång. Anropa verktyget save_lead bara om besökaren faktiskt valt att lämna sina uppgifter istället för att skriva in sig direkt, med namn, telefonnummer och en kort beskrivning av vad de vill ha hjälp med. Fråga aldrig om mer än vad som krävs för det. Svara alltid på svenska.`;

const SAVE_LEAD_TOOL: Anthropic.Tool = {
  name: "save_lead",
  description:
    "Sparar besökarens kontaktuppgifter och situation som ett lead. Anropas EN gång, bara om besökaren valt att lämna sina uppgifter istället för att skriva in sig direkt via signup-länken, när namn, telefonnummer och en kort beskrivning finns.",
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

// Ger botten ett sätt att faktiskt slå upp sidans innehåll istället för att
// gissa eller hitta på — t.ex. "hur många program/övningar finns det?"
// kunde den tidigare bara svara på med en gissning eller ett "det vet jag
// inte", trots att svaret finns rakt av i databasen (programs- resp.
// exercises-tabellen). Hämtar båda i samma anrop eftersom de ofta frågas
// om tillsammans/efter varandra i samma konversation.
const SITE_INFO_TOOL: Anthropic.Tool = {
  name: "get_site_info",
  description:
    "Hämtar verklig, aktuell information om vad som faktiskt finns på sidan just nu — antal träningsprogram (och hur de fördelar sig mellan gratis och Premium, samt kategorier) OCH antal enskilda övningar i övningsbanken (och hur de fördelar sig på kroppsdelar). Används för frågor om sidans FAKTISKA INNEHÅLL, inte priser/nivåer (de står redan i din instruktion).",
  input_schema: { type: "object", properties: {} },
};

async function getSiteInfo(): Promise<string> {
  const admin = createAdminClient();
  const [{ data: programs, error: programsError }, { data: exercises, error: exercisesError }] = await Promise.all([
    admin.from("programs").select("category, tier"),
    admin.from("exercises").select("body_part"),
  ]);

  if (programsError || !programs) {
    return JSON.stringify({ error: "Kunde inte hämta programdata just nu." });
  }

  const categoryCounts = new Map<string, number>();
  for (const row of programs) {
    categoryCounts.set(row.category, (categoryCounts.get(row.category) ?? 0) + 1);
  }

  const result: Record<string, unknown> = {
    totalPrograms: programs.length,
    freePrograms: programs.filter((r) => r.tier === "free").length,
    premiumPrograms: programs.filter((r) => r.tier === "premium").length,
    programCategories: [...categoryCounts.entries()].map(([category, count]) => ({ category, count })),
  };

  if (exercisesError || !exercises) {
    result.exercisesError = "Kunde inte hämta övningsdata just nu.";
  } else {
    const bodyPartCounts = new Map<string, number>();
    for (const row of exercises) {
      bodyPartCounts.set(row.body_part, (bodyPartCounts.get(row.body_part) ?? 0) + 1);
    }
    result.totalExercises = exercises.length;
    result.exercisesByBodyPart = [...bodyPartCounts.entries()].map(([bodyPart, count]) => ({ bodyPart, count }));
  }

  return JSON.stringify(result);
}

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
  // get_site_info-anrop (till skillnad från save_lead) avslutar inte
  // konversationen — modellen ska fortsätta med svaret när den fått datan
  // tillbaka, därför en växande meddelandelista och en loop istället för
  // ett enda anrop. tool_use/tool_result-blocken måste skickas tillbaka
  // precis i det format modellen gav/förväntar dem, inte som vanlig text.
  const conversationMessages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    for (let round = 0; round < 4; round++) {
      const response = await client.messages.create({
        model: "claude-sonnet-5-5",
        max_tokens: 1024,
        output_config: { effort: "medium" },
        system: SYSTEM_PROMPT,
        tools: [SAVE_LEAD_TOOL, SITE_INFO_TOOL],
        messages: conversationMessages,
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

      if (toolUse && toolUse.type === "tool_use" && toolUse.name === "get_site_info") {
        const siteInfo = await getSiteInfo();
        conversationMessages.push({ role: "assistant", content: response.content });
        conversationMessages.push({
          role: "user",
          content: [{ type: "tool_result", tool_use_id: toolUse.id, content: siteInfo }],
        });
        continue;
      }

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        return { type: "error", error: "Fick inget svar, försök igen." };
      }
      void logChatMessage(sessionId, "assistant", textBlock.text);
      return { type: "message", text: textBlock.text };
    }

    return { type: "error", error: "Något gick fel, försök igen." };
  } catch (err) {
    console.error("Chattbot-fel:", err);
    return { type: "error", error: "Något gick fel — försök igen om en liten stund." };
  }
}
