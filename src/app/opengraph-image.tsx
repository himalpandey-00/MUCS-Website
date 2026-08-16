import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Murdoch Cyber Security Club";

// Composes the untouched crest asset onto a branded background canvas for
// link previews — the logo pixels themselves are never stretched, cropped,
// or recoloured, only placed on a larger canvas alongside the wordmark.
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/mucs-crest.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          background:
            "radial-gradient(circle at 25% 30%, #1a0d10 0%, #070708 55%), #070708",
          padding: "0 96px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={420}
          height={420}
          style={{ objectFit: "contain", flexShrink: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#E12744",
              textTransform: "uppercase",
            }}
          >
            Murdoch University
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#F7F7F8",
              lineHeight: 1.05,
            }}
          >
            Cyber Security
            <br />
            Club
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
