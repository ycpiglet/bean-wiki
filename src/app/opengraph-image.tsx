import { ImageResponse } from "next/og";

export const alt = "Bean Wiki — Open Coffee Encyclopedia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Root OG image, auto-applied as og:image / twitter:image for every route.
// Latin-only text so it renders without loading a Korean webfont into satori.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "84px 90px",
          background: "#14170f",
          color: "#f4f0e7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="120" height="120" viewBox="0 0 48 48">
            <path
              d="M34.7 7.7C27.6 3.6 17 7.4 11.2 16.3 5.4 25.2 6.8 36 14 40.5c7.2 4.5 17.7.9 23.6-8 5.8-8.9 4.3-20.5-2.9-24.8Z"
              fill="#a6b673"
            />
            <path
              d="M34.5 8.4c-2.3 7.9-8.7 9.2-13 14.6-4.1 5.2-4.9 10.3-4.2 16.2"
              fill="none"
              stroke="#14170f"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
              BEAN WIKI
            </span>
            <span style={{ fontSize: 20, color: "#a6b673", letterSpacing: 4 }}>
              OPEN COFFEE ENCYCLOPEDIA
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
            Seed to cup,
          </span>
          <span style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, color: "#a6b673" }}>
            every bit of coffee.
          </span>
        </div>

        <span style={{ fontSize: 22, color: "#a0a394", letterSpacing: 3 }}>
          bean-wiki.vercel.app
        </span>
      </div>
    ),
    { ...size },
  );
}
