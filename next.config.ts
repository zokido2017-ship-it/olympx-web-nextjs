import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/organizations/profile",
        destination: "/organizations/olympx-elite",
        permanent: false,
      },
      {
        source: "/organizations/profile/:path*",
        destination: "/organizations/olympx-elite/:path*",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Silence multi-lockfile workspace detection when multiple package-lock.json exist on disk.
  turbopack: {
    root: dirname,
  },
};

export default nextConfig;
