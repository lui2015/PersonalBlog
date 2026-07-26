import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 页面文档与 API 响应关闭浏览器/共享缓存。
// 否则重新部署后浏览器可能复用旧 HTML（引用已被覆盖的旧 chunk），
// 导致页面数据加载失败、旧功能缺失。静态资源(_next/static 等)由 Next 自行长缓存。
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/_next") && !pathname.startsWith("/uploads")) {
    res.headers.set("Cache-Control", "no-store");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|uploads|favicon.ico).*)"],
};
