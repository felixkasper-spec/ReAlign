import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/brevo";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import { getBaseUrl } from "@/lib/base-url";

// Max 2 påminnelsemejl totalt per inaktivitetsperiod — ett efter en vecka,
// ett efter en månad, sedan inget mer (tidigare skickades ett nytt var 7:e
// dag på obestämd tid). reminder_count nollställs nedan så fort personen
// tränat igen efter sitt senaste påminnelsemejl, så en ny period av
// inaktivitet längre fram får en egen, färsk tvåmejls-cykel.
const INACTIVE_DAYS_FIRST = 7;
const INACTIVE_DAYS_SECOND = 30;
const MAX_REMINDERS = 2;
const MIN_ACCOUNT_AGE_DAYS = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const baseUrl = await getBaseUrl();
  const now = Date.now();

  const [{ data: profiles, error: profilesError }, { data: sessions, error: sessionsError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, display_name, created_at, last_reminder_sent_at, reminder_count")
        .eq("marketing_emails", true),
      supabase
        .from("logged_sessions")
        .select("user_id, completed_at")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false }),
    ]);

  if (profilesError || sessionsError) {
    console.error("Reminder cron query failed", profilesError ?? sessionsError);
    return Response.json(
      { error: (profilesError ?? sessionsError)?.message },
      { status: 500 },
    );
  }

  const lastTrained = new Map<string, string>();
  for (const s of sessions ?? []) {
    if (!lastTrained.has(s.user_id)) lastTrained.set(s.user_id, s.completed_at as string);
  }

  let sent = 0;
  const errors: { userId: string; message: string }[] = [];
  for (const profile of profiles ?? []) {
    const accountAgeDays = (now - new Date(profile.created_at).getTime()) / DAY_MS;
    if (accountAgeDays < MIN_ACCOUNT_AGE_DAYS) continue;

    const referenceDate = lastTrained.get(profile.id) ?? profile.created_at;
    const daysSinceActivity = (now - new Date(referenceDate).getTime()) / DAY_MS;

    // Självläkande nollställning: om personen tränat igen SEDAN sitt
    // senaste påminnelsemejl (lastTrained nyare än last_reminder_sent_at)
    // räknas de som en ny, färsk inaktivitetsperiod — annars skulle de
    // aldrig kunna få en påminnelse igen efter att redan fått 2 en gång.
    const trainedSinceLastReminder =
      profile.last_reminder_sent_at &&
      lastTrained.has(profile.id) &&
      new Date(lastTrained.get(profile.id)!).getTime() >
        new Date(profile.last_reminder_sent_at).getTime();
    const reminderCount = trainedSinceLastReminder ? 0 : (profile.reminder_count ?? 0);

    if (reminderCount >= MAX_REMINDERS) continue;

    const threshold = reminderCount === 0 ? INACTIVE_DAYS_FIRST : INACTIVE_DAYS_SECOND;
    if (daysSinceActivity < threshold) continue;

    if (!profile.email) continue;

    const name = profile.display_name?.trim() || "";
    const unsubscribe = unsubscribeUrl(baseUrl, profile.id);
    // Lite olika ton beroende på om det är det första (efter en vecka) eller
    // andra (efter en månad, sista) påminnelsemejlet.
    const isFirstReminder = reminderCount === 0;
    const bodyText = isFirstReminder
      ? "Vi har inte sett dig träna på ett tag. Inget krav — bara en påminnelse om att du är välkommen tillbaka när du känner för det."
      : "Det har gått en månad sedan du var inne och tränade. Vi hörs inte av fler påminnelser än den här, men du är så klart alltid välkommen tillbaka när det passar.";

    try {
      await sendEmail({
        to: [{ email: profile.email, ...(name ? { name } : {}) }],
        subject: "Vi saknar dig på ReAlign Metoden",
        replyTo: { email: "kontakt@realignmetoden.se", name: "ReAlign Metoden" },
        html: `<p>Hej${name ? ` ${name}` : ""},</p><p>${bodyText}</p><p><a href="${baseUrl}/min-sida">Fortsätt träna →</a></p><p>Vänliga hälsningar,<br>ReAlign Metoden</p><p style="font-size:12px;color:#888;margin-top:24px;">Vill du inte få fler mejl som det här? <a href="${unsubscribe}">Avsluta här</a>.</p>`,
        text: `Hej${name ? ` ${name}` : ""},\n\n${bodyText}\n\nFortsätt träna: ${baseUrl}/min-sida\n\nVänliga hälsningar,\nReAlign Metoden\n\nVill du inte få fler mejl som det här? Avsluta här: ${unsubscribe}`,
      });
      await supabase
        .from("profiles")
        .update({ last_reminder_sent_at: new Date().toISOString(), reminder_count: reminderCount + 1 })
        .eq("id", profile.id);
      sent++;
    } catch (e) {
      console.error("Failed to send reminder email", profile.id, e);
      errors.push({ userId: profile.id, message: (e as Error).message });
    }
  }

  return Response.json({ sent, errors });
}
