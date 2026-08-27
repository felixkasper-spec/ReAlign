import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/brevo";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import { getBaseUrl } from "@/lib/base-url";

// Hur länge en användare får vara inaktiv innan de får en påminnelse, hur
// sällan påminnelser skickas till samma person, och hur nya konton skonas
// innan de räknas som "inaktiva".
const INACTIVE_DAYS = 4;
const COOLDOWN_DAYS = 7;
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
        .select("id, email, display_name, created_at, last_reminder_sent_at")
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
    if (daysSinceActivity < INACTIVE_DAYS) continue;

    if (profile.last_reminder_sent_at) {
      const daysSinceReminder =
        (now - new Date(profile.last_reminder_sent_at).getTime()) / DAY_MS;
      if (daysSinceReminder < COOLDOWN_DAYS) continue;
    }

    if (!profile.email) continue;

    const name = profile.display_name?.trim() || "";
    const unsubscribe = unsubscribeUrl(baseUrl, profile.id);

    try {
      await sendEmail({
        to: [{ email: profile.email, ...(name ? { name } : {}) }],
        subject: "Vi saknar dig på ReAlign Metoden",
        replyTo: { email: "kontakt@realignmetoden.se", name: "ReAlign Metoden" },
        html: `<p>Hej${name ? ` ${name}` : ""},</p><p>Vi har inte sett dig träna på ett tag. Inget krav — bara en påminnelse om att du är välkommen tillbaka när du känner för det.</p><p><a href="${baseUrl}/min-sida">Fortsätt träna →</a></p><p>Vänliga hälsningar,<br>ReAlign Metoden</p><p style="font-size:12px;color:#888;margin-top:24px;">Vill du inte få fler mejl som det här? <a href="${unsubscribe}">Avsluta här</a>.</p>`,
        text: `Hej${name ? ` ${name}` : ""},\n\nVi har inte sett dig träna på ett tag. Inget krav — bara en påminnelse om att du är välkommen tillbaka när du känner för det.\n\nFortsätt träna: ${baseUrl}/min-sida\n\nVänliga hälsningar,\nReAlign Metoden\n\nVill du inte få fler mejl som det här? Avsluta här: ${unsubscribe}`,
      });
      await supabase
        .from("profiles")
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq("id", profile.id);
      sent++;
    } catch (e) {
      console.error("Failed to send reminder email", profile.id, e);
      errors.push({ userId: profile.id, message: (e as Error).message });
    }
  }

  return Response.json({ sent, errors });
}
