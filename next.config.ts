import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Silence multi-lockfile workspace detection when multiple package-lock.json exist on disk.
  turbopack: {
    root: dirname,
  },
};

export default nextConfig;
