import { ImageResponse } from "next/og";

export const alt = "Hassan Nazir — Multi-Agent AI Systems Engineer";
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
          justifyContent: "flex-end",
          padding: "64px 72px",
          background: "#05060a",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* mountain silhouette layers */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          viewBox="0 0 1200 630"
          preserveAspectRatio="none"
        >
          {/* far ridge */}
          <polygon
            points="0,630 0,420 120,340 240,380 360,290 480,320 600,200 720,270 840,300 960,210 1080,260 1200,310 1200,630"
            fill="#0d1730"
          />
          {/* mid ridge */}
          <polygon
            points="0,630 0,480 100,440 200,460 320,390 440,420 560,360 680,390 800,350 920,380 1040,330 1140,360 1200,380 1200,630"
            fill="#081020"
          />
          {/* near ridge */}
          <polygon
            points="0,630 0,530 80,510 180,530 280,490 380,515 480,480 580,500 680,470 780,495 880,460 980,485 1080,455 1200,475 1200,630"
            fill="#060d1e"
          />
          {/* horizon glow */}
          <ellipse cx="600" cy="310" rx="520" ry="140" fill="rgba(91,127,255,0.07)" />
          {/* road streak */}
          <polygon points="540,630 580,430 620,430 660,630" fill="rgba(91,127,255,0.06)" />
        </svg>

        {/* top-right mono label */}
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 72,
            display: "flex",
            color: "#5b7fff",
            fontSize: 13,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          Forward Deployed Engineer · Karakoram
        </div>

        {/* main name */}
        <div
          style={{
            display: "flex",
            fontSize: 110,
            fontWeight: 800,
            color: "#edeff5",
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
            marginBottom: 28,
            textShadow: "0 2px 40px rgba(5,6,10,0.9)",
          }}
        >
          HASSAN NAZIR
        </div>

        {/* role + location row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              color: "#9aa0b8",
              fontSize: 22,
              letterSpacing: "0.04em",
              fontFamily: "monospace",
              textTransform: "uppercase",
            }}
          >
            Forward Deployed Engineer · Applied AI
          </div>
          <div style={{ display: "flex", width: 1, height: 22, background: "rgba(138,144,166,0.3)" }} />
          <div
            style={{
              display: "flex",
              color: "#5b7fff",
              fontSize: 18,
              letterSpacing: "0.08em",
              fontFamily: "monospace",
              textTransform: "uppercase",
            }}
          >
            Islamabad, PK
          </div>
        </div>

        {/* bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 72,
            display: "flex",
            color: "rgba(138,144,166,0.5)",
            fontSize: 16,
            letterSpacing: "0.15em",
            fontFamily: "monospace",
          }}
        >
          hassannazir.dev
        </div>

        {/* cyan accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent, #7fe9ff 30%, #5b7fff 70%, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
