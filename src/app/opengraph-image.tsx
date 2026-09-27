import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/lib/data";

// the card shown when the link is shared (slack, whatsapp, x, linkedin…)
export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/media/logo-cat.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f4f3",
          backgroundImage: "radial-gradient(#d2d2cf 2px, transparent 2px)",
          backgroundSize: "40px 40px",
          color: "#111",
        }}
      >
        <img src={logoSrc} width={140} height={116} alt="" />
        <div style={{ marginTop: 36, fontSize: 108, fontWeight: 700, letterSpacing: -5 }}>{profile.name.toLowerCase()}</div>
        <div style={{ marginTop: 8, maxWidth: 900, fontSize: 34, color: "#6b6b6b", textAlign: "center" }}>{profile.tagline}</div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "10px 24px",
            borderRadius: 999,
            background: "white",
            border: "1.5px solid #e2e2e2",
            fontSize: 26,
            color: "#555",
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#10b981" }} />
          {profile.status}
        </div>
      </div>
    ),
    size,
  );
}
