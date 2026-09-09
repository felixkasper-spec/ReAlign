import { ImageResponse } from "next/og";

// Instagram-vänliga format — "portrait" är det Instagram själva
// rekommenderar för flöde/story (4:5), "square" för klassiskt flödesinlägg.
export const socialImageFormats = {
  portrait: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
} as const;

export type SocialImageFormat = keyof typeof socialImageFormats;

export function buildSocialImage({
  eyebrow,
  title,
  caption,
  format = "portrait",
}: {
  eyebrow?: string;
  title: string;
  caption?: string;
  format?: SocialImageFormat;
}) {
  const size = socialImageFormats[format] ?? socialImageFormats.portrait;
  const maxWidth = size.width - 128;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 64px",
          background: "#5e7461",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#8a9a8b",
              display: "flex",
            }}
          />
          <div style={{ display: "flex", fontSize: 32, fontFamily: "serif", letterSpacing: "0.02em" }}>
            ReAlign
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#d9e0d5",
                marginBottom: 20,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontFamily: "serif",
              lineHeight: 1.12,
              maxWidth,
            }}
          >
            {title}
          </div>
          {caption && (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.5,
                color: "#eef1ec",
                marginTop: 32,
                maxWidth,
              }}
            >
              {caption}
            </div>
          )}
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "#d9e0d5", letterSpacing: "0.04em" }}>
          realignmetoden.se
        </div>
      </div>
    ),
    { ...size },
  );
}
