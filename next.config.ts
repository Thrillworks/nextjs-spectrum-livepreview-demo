import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The deploy pipeline builds a standalone server for the container image.
  // Opt-in so local `npm run build` / `npm run start` keep working unchanged.
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [new URL("https://images.ctfassets.net/**")],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
