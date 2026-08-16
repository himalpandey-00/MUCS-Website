import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Renders the same crest asset used by <Logo> (src/components/Logo.tsx),
// scaled to fit — never cropped or redrawn.
export default async function Icon() {
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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={size.width} height={size.height} style={{ objectFit: "contain" }} />
      </div>
    ),
    { ...size }
  );
}
