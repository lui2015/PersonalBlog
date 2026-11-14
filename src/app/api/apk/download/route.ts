import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { APK_FILE } from "@/lib/server/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 流式下发管理员上传的 APK。
 * 未上传过时 302 回退到内置的 public/app-debug.apk。
 */
export async function GET(req: Request) {
  let size: number;
  try {
    const s = await stat(APK_FILE);
    if (!s.isFile()) throw new Error("not a file");
    size = s.size;
  } catch {
    return NextResponse.redirect(new URL("/app-debug.apk", req.url));
  }

  const stream = Readable.toWeb(
    createReadStream(APK_FILE)
  ) as ReadableStream<Uint8Array>;

  return new Response(stream, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Length": String(size),
      "Content-Disposition": 'attachment; filename="luliming-app.apk"',
      "Cache-Control": "no-store",
    },
  });
}
