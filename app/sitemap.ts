import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { blogPosts } from "@/lib/blog-posts";

const BASE_URL = "https://www.realignmetoden.se";

// Publika innehållssidor — konto-/verktygssidor (Min sida, inloggning,
// avprenumereringsbekräftelse osv.) har inget SEO-värde och utelämnas
// medvetet.
const STATIC_PATHS = [
  "/",
  "/program",
  "/ovningsbank",
  "/ergonomi",
  "/om-metoden",
  "/analys",
  "/premium",
  "/premium-coaching",
  "/faq",
  "/kontakt",
  "/om-oss",
  "/videosamtal",
  "/kommer-snart",
  "/integritetspolicy",
  "/blogg",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  const [{ data: programs }, { data: exercises }] = await Promise.all([
    supabase.from("programs").select("slug"),
    supabase.from("exercises").select("slug"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const programEntries: MetadataRoute.Sitemap = (programs ?? []).map((p) => ({
    url: `${BASE_URL}/program/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const exerciseEntries: MetadataRoute.Sitemap = (exercises ?? []).map((e) => ({
    url: `${BASE_URL}/ovningsbank/${e.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blogg/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticEntries, ...programEntries, ...exerciseEntries, ...blogEntries];
}
