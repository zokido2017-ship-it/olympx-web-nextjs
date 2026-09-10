import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backend.sportxo.in",
      },
      {
        protocol: "https",
        hostname: "www.sportxo.in",
      },
    ],
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
