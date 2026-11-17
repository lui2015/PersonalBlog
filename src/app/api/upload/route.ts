import { NextResponse } from "next/server";
import { checkApiAuth } from "@/lib/server/auth";
import { storage } from "@/lib/server/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

/** 允许的 MIME → 扩展名；Content-Type 由 COS 工具按扩展名推导，不信任客户端声明 */
const MIME_EXT = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["text/html", ".html"],
  ["text/plain", ".txt"],
  ["text/markdown", ".md"],
  ["application/pdf", ".pdf"],
  ["application/json", ".json"],
]);
const ALLOWED_EXT = new Set([...MIME_EXT.values(), ".jpeg", ".htm"]);

/** 优先用 MIME 定扩展名；md/html 等浏览器常报空或 octet-stream，再按文件名兜底 */
function resolveExt(file: Blob): string | null {
  const declared = (file.type || "").toLowerCase().split(";")[0].trim();
  const byMime = MIME_EXT.get(declared);
  if (byMime) return byMime;
  const name =
    typeof (file as File).name === "string" ? (file as File).name : "";
  const dot = name.lastIndexOf(".");
  const fromName = dot >= 0 ? name.slice(dot).toLowerCase() : "";
  return ALLOWED_EXT.has(fromName) ? fromName : null;
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

  const ext = resolveExt(file);
  if (!ext) {
    return NextResponse.json(
      {
        error:
          "unsupported type: 仅支持 jpg/png/webp/gif/svg/html/txt/md/pdf/json",
      },
      { status: 415 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let url: string;
  try {
    // 字节只在内存中流转 → COS；COS 失败直接报错，绝不回退写服务器磁盘
    url = await storage.save(buf, ext);
  } catch (err) {
    console.error(
      "[upload] COS 上传失败:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      { error: "COS 上传失败，请稍后重试" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    url,                       // COS 绝对 URL
    absoluteUrl: url,          // 兼容旧客户端
    cosUrl: url,               // 兼容旧客户端
    storage: "cos",            // 明确：无本地副本
    size: buf.length,
    type: file.type || "application/octet-stream",
  });
}
