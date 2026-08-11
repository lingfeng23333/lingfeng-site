import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lain.bgm.tv" },
      { protocol: "https", hostname: "images.bgm.tv" },
      { protocol: "https", hostname: "i.pixiv.re" },
    ],
  },
};

export default nextConfig;
