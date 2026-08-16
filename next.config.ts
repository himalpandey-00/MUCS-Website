import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — otherwise Next.js walks up looking
  // for the nearest lockfile and can pick up an unrelated one sitting in a
  // parent directory (e.g. C:\Users\<you>\package-lock.json from some other
  // project), which is outside this repo entirely.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
