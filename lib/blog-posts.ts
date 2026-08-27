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
];
