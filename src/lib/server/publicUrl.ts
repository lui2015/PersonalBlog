import "server-only";

/** 推断对外访问的绝对地址前缀（优先 PUBLIC_BASE_URL，其次反代请求头） */
export function originOf(req: Request): string {
  const env = (process.env.PUBLIC_BASE_URL || "").trim().replace(/\/$/, "");
  if (env) return env;
  const u = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || u.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || u.host;
  return `${proto}://${host}`;
}

/** 站内静态资源的绝对地址，供小程序等外部客户端直接使用 */
export function absoluteAssetUrl(req: Request, relativePath: string): string {
  return `${originOf(req)}${relativePath}`;
}
