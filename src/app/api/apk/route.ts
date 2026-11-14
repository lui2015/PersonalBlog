import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { randomBytes } from "node:crypto";
import { checkApiAuth } from "@/lib/server/auth";
import { APK_DIR, APK_FILE } from "@/lib/server/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 100 * 1024 * 1024; // 100MB

/** 读取当前已上传 APK 的元信息；不存在返回 null */
async function apkStat(): Promise<{ size: number; updatedAt: number } | null> {
  try {
    const s = await fs.stat(APK_FILE);
    if (!s.isFile()) return null;
    return { size: s.size, updatedAt: s.mtimeMs };
  } catch {
    return null;
  }
}

/** 查询当前 APK 元信息（公开）。未上传过时回退到内置 /app-debug.apk */
export async function GET() {
  const info = await apkStat();
  if (!info) {
    return NextResponse.json({ exists: false, url: "/app-debug.apk" });
  }
  return NextResponse.json({
    exists: true,
    url: "/api/apk/download",
    size: info.size,
    updatedAt: info.updatedAt,
  });
}

/** 管理员上传新 APK，原子替换旧包 */
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

  // 类型校验：扩展名或 MIME 需表明是 APK
  const name = file instanceof File ? file.name : "";
  const type = file.type || "";
  const extOk = name.toLowerCase().endsWith(".apk");
  const mimeOk = [
    "application/vnd.android.package-archive",
    "application/java-archive",
    "application/octet-stream",
  ].includes(type);
  if (!extOk && !mimeOk) {
    return NextResponse.json(
      { error: `unsupported type: ${type || "unknown"}` },
      { status: 415 }
    );
  }

  // 内容校验：APK 本质是 ZIP，必须以 PK 魔数开头，防止改扩展名伪装
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b) {
    return NextResponse.json({ error: "not a valid apk file" }, { status: 415 });
  }

  // 先写临时文件再原子重命名，避免替换过程中出现半截文件
  await fs.mkdir(APK_DIR, { recursive: true });
  const tmp = `${APK_FILE}.tmp-${randomBytes(4).toString("hex")}`;
  try {
    await fs.writeFile(tmp, buf);
    await fs.rename(tmp, APK_FILE);
  } catch (err) {
    try {
      await fs.unlink(tmp);
    } catch {
      /* ignore */
    }
    throw err;
  }

  return NextResponse.json({ ok: true, url: "/api/apk/download", size: buf.length });
}
