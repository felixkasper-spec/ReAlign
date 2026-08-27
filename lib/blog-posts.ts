export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

// Nyaste överst. Varje post är en egen route under app/blogg/<slug>,
// skriven som en vanlig sida (samma mönster som övriga marknadssidor) —
// den här listan är bara metadata för /blogg-index och sitemap.ts.
export const blogPosts: BlogPost[] = [
  {
    slug: "ont-i-nacken-kontorsarbete",
    title: "Ont i nacken av kontorsarbete — så tränar du bort det",
    excerpt:
      "Varför stillasittande skapar nackspänningar i första hand, och fem konkreta övningar som faktiskt gör skillnad.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "ont-i-ryggen-stillasittande",
    title: "Ont i ryggen av stillasittande — vanligaste orsakerna och vad som hjälper",
    excerpt:
      "Varför långvarigt sittande ger ont i ländryggen, och vilka övningar som faktiskt bygger upp stödet du saknar.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "ont-i-axlarna-skrivbordsarbete",
    title: "Ont i axlarna vid skrivbordsarbete — därför uppstår det",
    excerpt:
      "Rundade, framåtdragna axlar är en av de vanligaste följderna av skärmarbete. Så uppstår det, och så tränar du upp motståndet.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "spanningshuvudvark-och-hallning",
    title: "Spänningshuvudvärk och hållning — finns sambandet?",
    excerpt:
      "Många upplever att huvudvärken förvärras mot eftermiddagen efter en dag vid skärmen. Så hänger nacke, hållning och spänningshuvudvärk ihop.",
    publishedAt: "2026-08-27",
  },
];
