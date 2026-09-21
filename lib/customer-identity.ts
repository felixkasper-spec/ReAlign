// Cleers bokningskunder har inga konton (se app/boka) — enda stabila
// identiteten över flera bokningar är telefonnumret, men samma person kan
// skriva det som "070-123 45 67", "0701234567" eller "+46701234567". Alla
// journal-/formulärkopplingar nycklas därför på en normaliserad form av
// numret istället för strängen precis som den skrevs in.
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("46")) return `0${digits.slice(2)}`;
  if (digits.startsWith("0")) return digits;
  return digits ? `0${digits}` : digits;
}

// Internationellt format (+46...) — sms:-länkar (och en del andra appar)
// tolkar inte alltid ett svenskt "0"-nummer korrekt, +46 fungerar överallt.
export function toInternationalPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  return normalized.startsWith("0") ? `+46${normalized.slice(1)}` : normalized;
}
