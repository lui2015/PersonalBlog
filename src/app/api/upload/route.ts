import { NextResponse } from "next/server";
import { checkApiAuth } from "@/lib/server/auth";
import { storage } from "@/lib/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
]);

/** 推断对外访问的绝对地址前缀（小程序需要完整 URL 才能显示图片） */
function originOf(req: Request): string {
  const env = (process.env.PUBLIC_BASE_URL || "").trim().replace(/\/$/, "");
  if (env) return env;
  const u = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") || u.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || u.host;
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  if (!(await checkApiAuth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `file too large (max ${MAX_BYTES} bytes)` },
      { status: 413 }
    );
  }

  const type = file.type || "application/octet-stream";
  const ext = ALLOWED.get(type);
  if (!ext) {
    return NextResponse.json(
      { error: `unsupported type: ${type}` },
      { status: 415 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const url = await storage.save(buf, ext);
  return NextResponse.json({
    ok: true,
    url,                              // 相对路径 /uploads/xxx.jpg（Web 用）
    absoluteUrl: `${originOf(req)}${url}`, // 完整地址（小程序用）
    size: buf.length,
    type,
  });
}
