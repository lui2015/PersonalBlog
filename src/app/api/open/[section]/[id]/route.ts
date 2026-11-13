import { NextResponse } from "next/server";
import { mutateContent, readContent } from "@/lib/server/content";
import { checkApiAuth } from "@/lib/server/auth";
import { SECTION_KEYS, SECTION_META, withDerivedFields } from "@/lib/server/openApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ section: string; id: string }> };

function badSection() {
  return NextResponse.json(
    { ok: false, error: "unknown section", available: SECTION_KEYS },
    { status: 404 }
  );
}

/** GET /api/open/{section}/{id} — 获取单条，公开 */
export async function GET(_req: Request, ctx: Ctx) {
  const { section, id } = await ctx.params;
  const meta = SECTION_META[section];
  if (!meta) return badSection();
  if (meta.kind === "object") {
    const content = await readContent();
    return NextResponse.json({ ok: true, section, data: content[meta.key] });
  }

  const content = await readContent();
  const list = content[meta.key] as unknown as Record<string, unknown>[];
  const item = Array.isArray(list) ? list.find((x) => String(x.id) === id) : undefined;
  if (!item) {
    return NextResponse.json({ ok: false, error: "not found", id }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    section,
    data: withDerivedFields(section, item),
  });
}

/** PUT /api/open/{section}/{id} — 局部更新单条（合并字段），需要认证 */
export async function PUT(req: Request, ctx: Ctx) {
  const { section, id } = await ctx.params;
  const meta = SECTION_META[section];
  if (!meta) return badSection();
  if (!(await checkApiAuth(req))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let patch: Record<string, unknown>;
  try {
    patch = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return NextResponse.json({ ok: false, error: "body must be an object" }, { status: 400 });
  }

  try {
    const updated = await mutateContent((content) => {
      // hero 单例：合并到对象
      if (meta.kind === "object") {
        const obj = content[meta.key] as unknown as Record<string, unknown>;
        Object.assign(obj, patch);
        return { ...obj };
      }
      const list = content[meta.key] as unknown as Record<string, unknown>[];
      if (!Array.isArray(list)) throw new Error(`section ${section} is not an array`);
      const idx = list.findIndex((x) => String(x.id) === id);
      if (idx < 0) throw new Error("NOT_FOUND");
      // 不允许通过 patch 修改 id
      const { id: _ignored, ...rest } = patch;
      void _ignored;
      list[idx] = { ...list[idx], ...rest, id: list[idx].id };
      return list[idx];
    });
    return NextResponse.json({ ok: true, section, data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "not found", id }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}

/** DELETE /api/open/{section}/{id} — 删除单条，需要认证 */
export async function DELETE(req: Request, ctx: Ctx) {
  const { section, id } = await ctx.params;
  const meta = SECTION_META[section];
  if (!meta) return badSection();
  if (meta.kind === "object") {
    return NextResponse.json(
      { ok: false, error: `${section} 是单例对象，不支持删除` },
      { status: 405 }
    );
  }
  if (!(await checkApiAuth(req))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    await mutateContent((content) => {
      const list = content[meta.key] as unknown as Record<string, unknown>[];
      if (!Array.isArray(list)) throw new Error(`section ${section} is not an array`);
      const idx = list.findIndex((x) => String(x.id) === id);
      if (idx < 0) throw new Error("NOT_FOUND");
      list.splice(idx, 1);
    });
    return NextResponse.json({ ok: true, section, deleted: id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ ok: false, error: "not found", id }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
