import type { NextConfig } from "next";

const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
// Strip path suffix — the /api/v1 prefix comes from the rewrite source pattern
const backendUrl = rawBackendUrl.replace(/\/api\/v1\/?$/, "");

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
