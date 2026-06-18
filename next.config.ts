import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

const nextConfig: NextConfig = {
  experimental: {},
  outputFileTracingRoot: "/pnpm-lock.yaml",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
