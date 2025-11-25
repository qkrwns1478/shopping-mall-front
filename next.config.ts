import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
      {
        source: "/images/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/images/:path*`,
      }
    ];
  },
};

export default nextConfig;
