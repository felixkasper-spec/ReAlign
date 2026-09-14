import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReAlign Metoden",
    short_name: "ReAlign",
    description: "Postural Träning för en starkare, rörligare kropp.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#5e7461",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
