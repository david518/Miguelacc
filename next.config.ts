import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "10.46.192.96", "*.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s-cf-tw.shopeesz.com",
        pathname: "/file/**",
      },
      {
        protocol: "https",
        hostname: "cf.shopee.tw",
        pathname: "/file/**",
      },
    ],
  },
};

export default nextConfig;
