import { ImageResponse } from "next/og";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export function buildOgImage(title: string, eyebrow: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          background: "#5e7461",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#8a9a8b",
            }}
          />
          <div
            style={{
              fontSize: 30,
              fontFamily: "serif",
              letterSpacing: "0.02em",
            }}
          >
            ReAlign
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#d9e0d5",
            marginTop: 48,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontFamily: "serif",
            lineHeight: 1.15,
            marginTop: 14,
            maxWidth: 950,
          }}
        >
          {title}
        </div>
      </div>
    ),
    { ...ogImageSize },
  );
}
