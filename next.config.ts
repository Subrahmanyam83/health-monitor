import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts"],
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
