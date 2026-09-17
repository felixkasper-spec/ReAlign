// Kort, läsbar "hur länge sen"-text för färska leads (svarstid är det som
// spelar mest roll för konvertering) — faller tillbaka till absolut datum
// för sånt som ligger mer än en vecka bort, då blir relativ tid otydlig.
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "just nu";
  if (minutes < 60) return `${minutes} min sedan`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "timme" : "timmar"} sedan`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "dag" : "dagar"} sedan`;

  return new Date(iso).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}
