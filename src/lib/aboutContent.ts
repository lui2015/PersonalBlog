import { DEFAULT_CONTENT } from "./defaultContent";
import type { AboutContent, AboutSkill, AboutSocialLink, AboutTimelineItem } from "./types";

/** 只允许站内路径与 http(s) 外链，避免 javascript: 等伪协议造成 XSS */
export function isSafeImageUrl(url: string): boolean {
  const v = url.trim();
  if (!v || v.startsWith("//")) return false;
  return /^(https?:\/\/|\/)/i.test(v);
}

/**
 * SKILL TREE 兼容归一：
 * - 旧数据：string[]（只有标签名）
 * - 新数据：AboutSkill[]（每项可单独编辑，并可关联证书图片）
 */
export function normalizeSkillTree(input: unknown): AboutSkill[] {
  if (!Array.isArray(input)) {
    return DEFAULT_CONTENT.about.skillTree.map((s) => ({ ...s }));
  }
  const ids = new Set<string>();
  const result: AboutSkill[] = [];
  input.forEach((raw, i) => {
    let id = `sk-${i + 1}`;
    let name = "";
    let certificate = "";
    if (typeof raw === "string") {
      name = raw.trim();
    } else if (raw && typeof raw === "object") {
      const o = raw as Record<string, unknown>;
      if (typeof o.id === "string" && o.id) id = o.id;
      if (typeof o.name === "string") name = o.name.trim();
      if (typeof o.certificate === "string" && isSafeImageUrl(o.certificate)) {
        certificate = o.certificate.trim();
      }
    }
    if (!name) return;
    if (ids.has(id)) id = `${id}-${i + 1}`;
    ids.add(id);
    result.push({ id, name, certificate });
  });
  return result;
}

/** 合并「关于我」默认值，并把历史 string[] 技能标签升级为新结构 */
export function mergeAbout(raw: unknown): AboutContent {
  const o =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  return {
    ...DEFAULT_CONTENT.about,
    ...(o as Partial<AboutContent>),
    socialLinks: Array.isArray(o.socialLinks)
      ? (o.socialLinks as AboutSocialLink[])
      : DEFAULT_CONTENT.about.socialLinks.map((x) => ({ ...x })),
    skillTree: normalizeSkillTree(o.skillTree ?? DEFAULT_CONTENT.about.skillTree),
    timeline: Array.isArray(o.timeline)
      ? (o.timeline as AboutTimelineItem[])
      : DEFAULT_CONTENT.about.timeline.map((x) => ({ ...x })),
  };
}
