import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  outputFileTracingIncludes: {
    "/api/scrape-recipe": ["./node_modules/youtube-dl-exec/bin/yt-dlp"],
  },
};

export default nextConfig;
