const DAY_MS = 24 * 60 * 60 * 1000;

// Påminner om nästa steg i 3-stegs uppföljningskadensen för ett lead som
// inte svarar i telefon (se SMS_TEMPLATES i LeadControls.tsx): SMS 1 skickas
// direkt vid missat samtal, SMS 2 dagen efter, SMS 3 som sista försök efter
// 3+ dagar. Räknas från senaste statusändringen, inte från när leadet kom
// in, så påminnelsen matchar när coachen faktiskt senast försökte nå dem.
export function getFollowUpReminder(statusUpdatedAt: string): string | null {
  const daysSince = (Date.now() - new Date(statusUpdatedAt).getTime()) / DAY_MS;

  if (daysSince >= 3) return "⏰ Dags för sista uppföljningen (SMS 3)";
  if (daysSince >= 1) return "⏰ Dags för uppföljning 2 (ring + SMS 2)";
  return null;
}
