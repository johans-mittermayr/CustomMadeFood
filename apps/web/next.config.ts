import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@custom-made-food/db", "@custom-made-food/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
