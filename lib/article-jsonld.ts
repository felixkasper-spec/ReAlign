// Strukturerad data för blogginläggen — MedicalWebPage (mer specifikt än
// bara Article eftersom innehållet är hälsorelaterat) med en namngiven,
// meriterad författare. Ger AI-svarsmotorer och sökmotorer tydliga signaler
// om vem som skrivit och varför källan är trovärdig (E-E-A-T), utöver att
// själva sidans text redan är crawlbar.
export function buildArticleJsonLd({
  title,
  description,
  path,
  datePublished,
}: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
}) {
  const url = `https://www.realignmetoden.se${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: title,
    description,
    url,
    datePublished,
    dateModified: datePublished,
    inLanguage: "sv-SE",
    isPartOf: {
      "@type": "WebSite",
      name: "ReAlign Metoden",
      url: "https://www.realignmetoden.se",
    },
    author: {
      "@type": "Person",
      name: "Felix Eliasson",
      jobTitle: "Postural Terapeut",
      description:
        "Utbildad Postural Terapeut via Optimum-Metoden, med fem års erfarenhet och över 1 500 hjälpta patienter.",
      url: "https://www.realignmetoden.se/om-oss",
    },
    publisher: {
      "@type": "Organization",
      name: "ReAlign Metoden",
      url: "https://www.realignmetoden.se",
      logo: {
        "@type": "ImageObject",
        url: "https://www.realignmetoden.se/logo.png",
      },
    },
  };
}
