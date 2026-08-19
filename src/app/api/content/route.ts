import { NextResponse } from "next/server";
import { readContent, writeContent } from "@/lib/server/content";
import { checkApiAuth } from "@/lib/server/auth";
import type { SiteContent } from "@/lib/types";

// 这条路由必须在 Node runtime（用到 fs / crypto）
export const runtime = "nodejs";
// 永远动态（不缓存读取）
export const dynamic = "force-dynamic";

export async function GET() {
  const content = await readContent();
  return NextResponse.json(content, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function PUT(req: Request) {
  if (!(await checkApiAuth(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!isSiteContent(body)) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  await writeContent(body);
  return NextResponse.json({ ok: true });
}

function isSiteContent(v: unknown): v is SiteContent {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.hero === "object" &&
    Array.isArray(o.poems) &&
    Array.isArray(o.photos) &&
    Array.isArray(o.stats) &&
    Array.isArray(o.skills) &&
    Array.isArray(o.myskills) &&
    Array.isArray(o.quotes) &&
    Array.isArray(o.works) &&
    Array.isArray(o.videos) &&
    Array.isArray(o.albums) &&
    Array.isArray(o.softwares)
  );
}
