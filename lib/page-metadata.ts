import type { Metadata } from "next";

export function pageMetadata({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  /** Omit to let a colocated opengraph-image.tsx file (per-slug dynamic
   * routes) provide the image instead — passing a static path here would
   * compete with it. */
  image?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
