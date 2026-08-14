import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.author.title}`;

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
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #2563eb 100%)",
          padding: "80px 96px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #38bdf8, #2563eb)",
            borderRadius: 16,
            padding: "12px 24px",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          {siteConfig.heroName}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            color: "#94a3b8",
            lineHeight: 1.4,
          }}
        >
          {siteConfig.author.title}
        </div>
      </div>
    ),
    { ...size },
  );
}