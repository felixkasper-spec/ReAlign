// Skiljer på Vimeo-embeds (kräver Vimeos iframe-spelare) och direktlänkade
// videofiler (t.ex. egeninspelade klipp uppladdade till Supabase Storage,
// som spelas upp med en vanlig <video>-tagg).
export function isVimeoUrl(url: string): boolean {
  return /vimeo\.com/.test(url);
}
