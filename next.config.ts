import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve("."),
  },
  images: {
    remotePatterns: [
      // Unsplash placeholders for hero / project-type tiles (Phase 2/3)
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase Storage (set via env var SUPABASE_URL host once provisioned)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // Allow large image responses (catalog imports up to ~3 MB per shot)
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
