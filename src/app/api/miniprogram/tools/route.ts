import { NextResponse } from "next/server";
import { readContent } from "@/lib/server/content";
import { visibleMiniProgramTools } from "@/lib/miniProgramTools";
import { CORS_HEADERS } from "@/lib/server/openApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/miniprogram/tools
 * 小程序端专用只读接口（公开，无需认证）。
 * 默认只返回「可见」的分组与工具，小程序直接渲染即可实现按配置显示 / 隐藏；
 * ?all=1 返回完整配置（含隐藏项），供调试与后台核对。
 */
export async function GET(req: Request) {
  const content = await readContent();
  const config = content.miniProgramTools;
  const url = new URL(req.url);
  const includeHidden = url.searchParams.get("all") === "1";

  const view = includeHidden
    ? {
        title: config.title,
        enabled: config.enabled,
        groups: config.groups,
        totalGroups: config.groups.length,
        totalTools: config.groups.reduce((n, g) => n + g.tools.length, 0),
      }
    : visibleMiniProgramTools(config);

  return NextResponse.json(
    {
      ok: true,
      visibleOnly: !includeHidden,
      ...view,
    },
    {
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "no-store",
      },
    }
  );
}
