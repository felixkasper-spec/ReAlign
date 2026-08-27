import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/min-sida", "/coaching", "/avprenumererad"],
    },
    sitemap: "https://www.realignmetoden.se/sitemap.xml",
  };
}
