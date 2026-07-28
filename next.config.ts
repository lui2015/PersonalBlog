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
        // 静态资源：每次都校验，不使用旧缓存
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // HTML 文档绝对不缓存，确保始终拿到最新引用（杜绝浏览器复用旧页面）
        source: "/:path((?!_next/).*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
