import { ImageResponse } from "next/og";

export const alt = "Swara Ranjana 2026 — Live Musical Experience";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#FEFFFF",
          color: "#0E1721",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 9999,
            border: "1px solid rgba(34,113,177,0.18)",
            right: -120,
            top: -180,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 330,
            height: 330,
            borderRadius: 9999,
            border: "1px solid rgba(14,23,33,0.08)",
            right: 20,
            top: -80,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            top: 54,
            height: 1,
            background: "rgba(14,23,33,0.12)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: 18,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#2271B1",
              }}
            >
              Live Musical Experience · 2026
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Arial, sans-serif",
                fontSize: 15,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#7D8A95",
              }}
            >
              St. Sylvester&apos;s College · Kandy
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                fontSize: 120,
                lineHeight: 0.84,
                letterSpacing: "-0.055em",
                fontWeight: 400,
              }}
            >
              SWARA
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 120,
                lineHeight: 0.9,
                letterSpacing: "-0.055em",
                fontStyle: "italic",
                color: "#2271B1",
              }}
            >
              RANJANA
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                width: 620,
                fontSize: 24,
                lineHeight: 1.4,
                color: "#31465A",
              }}
            >
              An evening where voices, melodies and memories become one.
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: "Arial, sans-serif",
                fontSize: 15,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#7D8A95",
              }}
            >
              <div style={{ display: "flex", width: 42, height: 1, background: "#2271B1" }} />
              Swara Ranjana
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
