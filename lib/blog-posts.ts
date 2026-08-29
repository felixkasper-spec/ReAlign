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
      "Ländryggens ytliga muskler har ofta fått en hållningsroll de inte är byggda för. Varför det händer, och vilka övningar som faktiskt bygger upp rätt stöd.",
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
    slug: "tecken-pa-dalig-hallning",
    title: "Vanliga tecken på dålig hållning",
    excerpt:
      "Hållningsobalanser byggs ofta upp gradvis, långt innan de gör ont. Så upptäcker du de vanligaste tecknen hos dig själv.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "postural-traning-vs-styrketraning",
    title: "Postural träning vs. vanlig styrketräning — vad är skillnaden?",
    excerpt:
      "Övningarna kan se förvillande lika ut på ytan — men fokuset, musklerna som prioriteras och målet skiljer sig markant.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "kontorsergonomi-guide",
    title: "Kontorsergonomi — komplett guide för hemmakontoret",
    excerpt:
      "Stol, skärm, skrivbord och pauser — en konkret checklista för en arbetsplats som inte sliter på kroppen.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "hur-ofta-bor-man-trana-hallning",
    title: "Hur ofta bör man träna hållning?",
    excerpt:
      "Ett enkelt svar på en fråga som ofta känns krångligare än den behöver vara — utan att kräva perfektion.",
    publishedAt: "2026-08-27",
  },
  {
    slug: "hjalper-staskrivbord-mot-dalig-hallning",
    title: "Hjälper ett ståskrivbord verkligen mot dålig hållning?",
    excerpt:
      "Ståskrivbord säljs ofta som lösningen på kontorshållning. Delvis sant — men det räcker inte att bara byta stillasittande mot stillastående.",
    publishedAt: "2026-08-27",
  },
];
