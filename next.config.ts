import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts"],
  serverExternalPackages: ["unpdf"],
  // Required for ffmpeg.wasm SharedArrayBuffer on the voice-reducer page
  async headers() {
    return [
      {
        source: "/voice-reducer/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
