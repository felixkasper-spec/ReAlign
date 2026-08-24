import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
              fontSize: 34,
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
            fontSize: 68,
            fontFamily: "serif",
            lineHeight: 1.15,
            marginTop: 40,
            maxWidth: 900,
          }}
        >
          Hållningsträning som håller.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#e3e9e1",
            marginTop: 28,
          }}
        >
          Program · Övningsbank · Ergonomiguider
        </div>
      </div>
    ),
    { ...size },
  );
}
