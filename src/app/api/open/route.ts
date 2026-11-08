import { NextResponse } from "next/server";
import { readContent } from "@/lib/server/content";
import { SECTION_META, SECTION_KEYS } from "@/lib/server/openApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/open
 * 开放接口索引：列出所有可访问的数据模块、字段定义与当前条目数。
 * 公开，无需认证。小程序可用它做「数据字典」动态渲染。
 */
export async function GET() {
  const content = await readContent();
  const sections = SECTION_KEYS.map((key) => {
    const meta = SECTION_META[key];
    const value = content[meta.key];
    return {
      key,
      label: meta.label,
      description: meta.description,
      kind: meta.kind,
      count: Array.isArray(value) ? value.length : 1,
      orderField: meta.orderField,
      required: meta.required,
      fields: meta.fields,
      endpoints: {
        list: `/api/open/${key}`,
        detail: meta.kind === "array" ? `/api/open/${key}/{id}` : null,
      },
    };
  });

  return NextResponse.json({
    ok: true,
    version: "v1",
    baseUrl: "/api/open",
    auth: {
      read: "公开，无需认证",
      write: "请求头 X-Admin-User / X-Admin-Pass，或查询参数 ?user=&pass=",
    },
    commonQuery: {
      order: "asc | desc（默认 desc，最新在前）",
      q: "关键词搜索（匹配条目所有字符串字段）",
      page: "页码，默认 1",
      pageSize: "每页条数，默认 20，最大 200",
    },
    sections,
  });
}
