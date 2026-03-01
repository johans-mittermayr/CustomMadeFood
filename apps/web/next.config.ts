import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@custom-made-food/db", "@custom-made-food/shared"],
};

export default nextConfig;
