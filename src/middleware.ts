import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, X-Admin-User, X-Admin-Pass, Authorization",
  "Access-Control-Max-Age": "86400",
};

// 页面文档与 API 响应关闭浏览器/共享缓存。
// 否则重新部署后浏览器可能复用旧 HTML（引用已被覆盖的旧 chunk），
// 导致页面数据加载失败、旧功能缺失。静态资源(_next/static 等)由 Next 自行长缓存。
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // 开放接口统一处理 CORS 预检（供小程序 / H5 / 第三方客户端调用）
  if (isApi && req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  const res = NextResponse.next();
  if (!pathname.startsWith("/_next") && !pathname.startsWith("/uploads")) {
    res.headers.set("Cache-Control", "no-store");
  }
  if (isApi) {
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      res.headers.set(k, v);
    }
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|uploads|favicon.ico).*)"],
};
