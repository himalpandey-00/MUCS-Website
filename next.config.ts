import path from "node:path";
import type { NextConfig } from "next";

// next/image (used by src/components/Avatar.tsx) blocks any external image
// host by default — with no remotePatterns configured at all, EVERY pasted
// photo URL silently failed to render, regardless of source. This allows
// just our own Supabase Storage public bucket (see
// src/lib/storage/team-photos.ts); a pasted URL from some other host still
// won't render, same as before.
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
    // Server Actions default to a 1MB request body cap — too small for a
    // phone-camera team photo. createTeamMember/updateTeamMember
    // (src/app/admin/(dashboard)/team/actions.ts) accept uploads up to
    // TEAM_PHOTO_MAX_BYTES (5MB); this leaves headroom for multipart
    // overhead and the rest of the form fields.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
