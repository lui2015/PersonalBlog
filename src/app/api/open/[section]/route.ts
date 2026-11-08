import { NextResponse } from "next/server";
import { mutateContent, readContent } from "@/lib/server/content";

import { checkApiAuth } from "@/lib/server/auth";
import {
  SECTION_KEYS,
  SECTION_META,
  makeId,
  matchKeyword,
  sortItems,
} from "@/lib/server/openApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ section: string }> };

function badSection() {
  return NextResponse.json(
    { ok: false, error: `unknown section`, available: SECTION_KEYS },
    { status: 404 }
  );
}

/**
 * GET /api/open/{section}
 * 获取某个模块的数据。列表模块支持分页/排序/搜索；hero 返回对象。
 * 公开，无需认证。
 */
export async function GET(req: Request, ctx: Ctx) {
  const { section } = await ctx.params;
  const meta = SECTION_META[section];
  if (!meta) return badSection();

  const content = await readContent();
  const value = content[meta.key];

  // hero 是单例对象，直接返回
  if (meta.kind === "object") {
    return NextResponse.json({
      ok: true,
      section,
      label: meta.label,
      kind: meta.kind,
      data: value,
    });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSizeRaw = Number.parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20;
  const pageSize = Math.min(Math.max(1, pageSizeRaw), 200);

  const all = (Array.isArray(value) ? value : []) as unknown as Record<string, unknown>[];
  const matched = all.filter((item) => matchKeyword(item, q));
  const sorted = sortItems(matched, section, order);
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return NextResponse.json({
    ok: true,
    section,
    label: meta.label,
    kind: meta.kind,
    total,
    page,
    pageSize,
    hasMore: start + items.length < total,
    order,
    q: q || undefined,
    items,
  });
}

/**
 * POST /api/open/{section}
 * 新增一条数据（仅列表模块）。需要认证。
 * body: JSON 对象，缺少 id 时自动生成；必填字段见 /api/open 索引。
 */
export async function POST(req: Request, ctx: Ctx) {
  const { section } = await ctx.params;
  const meta = SECTION_META[section];
  if (!meta) return badSection();
  if (meta.kind === "object") {
    return NextResponse.json(
      { ok: false, error: `${section} 是单例对象，请用 PUT 更新` },
      { status: 405 }
    );
  }
  if (!(await checkApiAuth(req))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "body must be an object" }, { status: 400 });
  }

  const missing = meta.required.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ""
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `missing required fields: ${missing.join(", ")}`, required: meta.required },
      { status: 400 }
    );
  }

  const item: Record<string, unknown> = {
    ...body,
    id: typeof body.id === "string" && body.id ? body.id : makeId(meta.idPrefix),
  };

  try {
    const created = await mutateContent((content) => {
      const list = content[meta.key] as unknown as Record<string, unknown>[];
      if (!Array.isArray(list)) throw new Error(`section ${section} is not an array`);
      if (list.some((x) => x.id === item.id)) {
        throw new Error(`id already exists: ${item.id}`);
      }
      list.push(item);
      return item;
    });
    return NextResponse.json({ ok: true, section, data: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/open/{section}
 * 整块替换某个模块的数据（慎用，会覆盖该模块全部内容）。需要认证。
 * body: 数组（列表模块）或对象（hero），也可用 { data: ... } 包裹。
 */
export async function PUT(req: Request, ctx: Ctx) {
  const { section } = await ctx.params;
  const meta = SECTION_META[section];
  if (!meta) return badSection();
  if (!(await checkApiAuth(req))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const payload =
    body && typeof body === "object" && !Array.isArray(body) && "data" in body
      ? (body as { data: unknown }).data
      : body;

  if (meta.kind === "array" ? !Array.isArray(payload) : typeof payload !== "object" || payload === null) {
    return NextResponse.json(
      { ok: false, error: `${section} requires ${meta.kind === "array" ? "an array" : "an object"}` },
      { status: 400 }
    );
  }

  await mutateContent((content) => {
    (content as unknown as Record<string, unknown>)[meta.key as string] = payload;
  });

  const count = Array.isArray(payload) ? payload.length : 1;
  return NextResponse.json({ ok: true, section, count });
}
