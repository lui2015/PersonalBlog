import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  // 强制每次构建产物路径唯一，避免浏览器缓存旧 JS 导致 Server Action 不匹配 / 整页崩溃
  generateBuildId: async () => `build-${Date.now()}`,
  async headers() {
    return [
      {
        // 所有 Next.js 静态产物（JS/CSS/JSON）一律不缓存，杜绝浏览器复用旧 bundle
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
        ],
      },
      {
        // HTML 文档绝对不缓存
        source: "/:path((?!_next/).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
