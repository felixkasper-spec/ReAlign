// Validerar en "next"-destination från en query-parameter innan den
// används i en redirect. Bara relativa sökvägar inom sajten är tillåtna —
// annars kan parametern missbrukas som en öppen redirect (t.ex.
// "https://evil.com" eller "//evil.com", som webbläsare tolkar som en
// extern URL trots det inledande snedstrecket).
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/min-sida",
): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return fallback;
}
