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
    slug: "ont-i-nacken",
    title: "Ont i nacken — så tränar du bort det",
    excerpt:
      "Varför nacken gör ont i första hand — vanligast kopplat till stillasittande, men inte bara det — och fem konkreta övningar som faktiskt gör skillnad.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "ont-i-ryggen",
    title: "Ont i ryggen — vanligaste orsakerna och vad som hjälper",
    excerpt:
      "Ryggsmärta sitter sällan bara i ryggen. Så hänger bröstrygg, bäcken och resten av kroppen ihop med ryggvärk, och vilka övningar som faktiskt hjälper.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "ont-i-landryggen",
    title: "Ont i ländryggen — vanligaste orsakerna och vad som hjälper",
    excerpt:
      "Varför ländryggen gör ont — vid stillasittande men även av andra orsaker — och vilka övningar som faktiskt bygger upp stödet du saknar.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "ont-i-axeln",
    title: "Ont i axeln — därför uppstår det och vad som hjälper",
    excerpt:
      "Axelsmärta och stela, framåtdragna axlar hänger ofta ihop med samma grundorsak. Så uppstår det, och så tränar du upp motståndet.",
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
