import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Silence multi-lockfile workspace detection when multiple package-lock.json exist on disk.
  turbopack: {
    root: dirname,
  },
  // Hide the Next.js fingerprint on self-hosted responses.
  poweredByHeader: false,
  // Let nginx stream App Router responses instead of buffering the full body.
  async headers() {
    return [
      {
        source: "/:path*{/}?",
        headers: [{ key: "X-Accel-Buffering", value: "no" }],
      },
    ];
  },
};

export default nextConfig;
