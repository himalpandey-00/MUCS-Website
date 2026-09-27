import path from "node:path";
import type { NextConfig } from "next";

// Our own photos (team photos, gallery) are resized server-side into WebP
// and rendered with next/image's `unoptimized`, so they don't go through
// the image optimizer at all (and don't use Vercel's optimization quota).
// This allow-list only matters for any future optimized image served from
// our public Supabase Storage buckets (src/lib/storage/buckets.ts).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — otherwise Next.js walks up looking
  // for the nearest lockfile and can pick up an unrelated one sitting in a
  // parent directory (e.g. C:\Users\<you>\package-lock.json from some other
  // project), which is outside this repo entirely.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  experimental: {
    // Server Actions default to a 1MB request body cap. Photo uploads are
    // shrunk in the browser to ~1 MB first (src/lib/images/
    // prepare-upload.ts) and the server accepts at most MAX_UPLOAD_BYTES
    // (4 MB, src/lib/images/limits.ts) — this leaves headroom for that plus
    // multipart overhead and the rest of the form fields. (On Vercel a
    // request body is capped at 4.5 MB regardless.)
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
