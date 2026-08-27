import type { Metadata } from "next";

export function pageMetadata({
  title,
  description,
  image,
  path,
}: {
  title: string;
  description: string;
  /** Omit to let a colocated opengraph-image.tsx file (per-slug dynamic
   * routes) provide the image instead — passing a static path here would
   * compete with it. */
  image?: string;
  /** Sidans egen sökväg (t.ex. "/program" eller `/program/${slug}`), för
   * canonical-taggen. Utan den pekar canonical fel på sidor som nås via
   * flera URL:er (query-parametrar m.m.), vilket kan splittra SEO-värdet
   * mellan flera varianter av samma sida i Googles ögon. */
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
