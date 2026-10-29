// Delad av CheckinCard.tsx (förifyller varannan-veckan-avstämningens
// meddelande) och FollowupScheduler.tsx (dropdown med färdiga meddelanden
// när man schemalägger en påminnelse) — EN källa till texten så de aldrig
// kan hamna i otakt med varandra.

// Namnfältet är ofta för- och efternamn ihop — meddelandena ska bara
// hälsa med förnamnet, samma mönster som lib/brevo.ts använder för
// annons-leads.
export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function buildCheckinMessage(name: string): string {
  const firstName = firstNameOf(name);
  return `Hej ${firstName}! Hur går det med träningen? Känns övningarna rätt fortfarande, eller är det dags att se över och eventuellt lägga till något nytt? Hör av dig om du har frågor!`;
}

export type CadenceMessageTemplate = {
  label: string;
  build: (name: string) => string;
};

export const CADENCE_MESSAGE_TEMPLATES: CadenceMessageTemplate[] = [
  { label: "Varannan-veckan-avstämning", build: buildCheckinMessage },
];
