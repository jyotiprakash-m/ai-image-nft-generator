import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["img.clerk.com"], // Add the external hostname here
  },
};

export default nextConfig;
