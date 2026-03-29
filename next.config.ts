import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  outputFileTracingIncludes: {
    "/api/scrape-recipe": ["./bin/yt-dlp"],
  },
};

export default nextConfig;
