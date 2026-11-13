import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT_FILE, DATA_DIR } from "./paths";
import { DEFAULT_CONTENT } from "../defaultContent";
import { mergeAbout } from "../aboutContent";
import type { SiteContent } from "../types";

/** 确保 data 目录存在 */
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** 读取站点内容；不存在则用默认值落盘 */
export async function readContent(): Promise<SiteContent> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(CONTENT_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return mergeWithDefault(parsed);
  } catch (err: unknown) {
    if (isNotFound(err)) {
      await writeContent(DEFAULT_CONTENT);
      return DEFAULT_CONTENT;
    }
    // 文件损坏：返回默认（不覆盖原文件，留个底）
    console.error("[content] read failed, fallback to default:", err);
    return DEFAULT_CONTENT;
  }
}

/** 原子写入：先写 .tmp 再 rename，避免并发/掉电写坏文件 */
export async function writeContent(content: SiteContent): Promise<void> {
  await ensureDataDir();
  const tmp = path.join(DATA_DIR, `site-content.${process.pid}.${Date.now()}.tmp`);
  // 写入口统一清洗：归一技能标签结构；剔除客户端回传的只读派生字段 contentHtml
  const works = Array.isArray(content.works)
    ? (content.works.map((w) => {
        const { contentHtml: _ignored, ...rest } =
          w as unknown as Record<string, unknown>;
        void _ignored;
        return rest;
      }) as unknown as SiteContent["works"])
    : content.works;
  const data = JSON.stringify(
    { ...content, about: mergeAbout(content.about), works },
    null,
    2
  );
  await fs.writeFile(tmp, data, "utf-8");
  await fs.rename(tmp, CONTENT_FILE);
}

/**
 * 串行化的「读-改-写」：避免多个开放接口并发修改时互相覆盖。
 * 返回 mutate 的结果；mutate 抛错时不写盘。
 */
let writeQueue: Promise<unknown> = Promise.resolve();
export function mutateContent<T>(
  mutate: (content: SiteContent) => T | Promise<T>
): Promise<T> {
  const run = writeQueue.then(async () => {
    const content = await readContent();
    const result = await mutate(content);
    await writeContent(content);
    return result;
  });
  // 无论成功失败都继续排空队列
  writeQueue = run.catch(() => undefined);
  return run;
}

/** 字段级合并默认值，防止旧文件缺字段导致前端崩 */
function mergeWithDefault(p: Partial<SiteContent>): SiteContent {
  return {
    hero: { ...DEFAULT_CONTENT.hero, ...(p.hero ?? {}) },
    poems: p.poems ?? DEFAULT_CONTENT.poems,
    photos: p.photos ?? DEFAULT_CONTENT.photos,
    stats: p.stats ?? DEFAULT_CONTENT.stats,
    skills: p.skills ?? DEFAULT_CONTENT.skills,
    myskills: p.myskills ?? DEFAULT_CONTENT.myskills,
    quotes: p.quotes ?? DEFAULT_CONTENT.quotes,
    works: p.works ?? DEFAULT_CONTENT.works,
    videos: p.videos ?? DEFAULT_CONTENT.videos,
    albums: p.albums ?? DEFAULT_CONTENT.albums,
    softwares: p.softwares ?? DEFAULT_CONTENT.softwares,
    socialMedia: p.socialMedia ?? DEFAULT_CONTENT.socialMedia,
    about: mergeAbout(p.about),
  };
}

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "ENOENT"
  );
}
