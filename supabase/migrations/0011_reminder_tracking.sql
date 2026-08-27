-- Spårar senast skickad träningspåminnelse per användare, så cron-jobbet
-- inte skickar ett nytt påminnelsemejl varje dag till samma inaktiva
-- användare (max en gång per svalperiod, se app/api/cron/reminders).

alter table public.profiles
  add column last_reminder_sent_at timestamptz;
