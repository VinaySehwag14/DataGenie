import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling strict server-side packages
  // This works for both Webpack and Turbopack in Next.js 15+
  serverExternalPackages: ["duckdb"],
};

export default nextConfig;
