import "server-only";
import { randomBytes } from "node:crypto";
import type { SiteContent } from "../types";

/** 开放接口支持的模块（与 SiteContent 字段一一对应） */
export interface SectionMeta {
  key: keyof SiteContent;
  label: string;
  description: string;
  /** array = 列表集合；object = 单例对象（hero） */
  kind: "array" | "object";
  /** 新增时的必填字段 */
  required: string[];
  /** 字段说明 */
  fields: Record<string, string>;
  /** 排序依据字段（有 date 用 date，否则用 id） */
  orderField: "date" | "id";
  /** 自动生成 id 的前缀 */
  idPrefix: string;
}

export const SECTION_META: Record<string, SectionMeta> = {
  hero: {
    key: "hero",
    label: "首页信息",
    description: "头像、姓名、副标题（单例对象，不支持新增/删除）",
    kind: "object",
    required: [],
    fields: {
      title: "姓名/主标题",
      subtitle: "副标题",
      avatarText: "头像占位文字（无图片时显示）",
      avatarUrl: "头像图片 URL",
    },
    orderField: "id",
    idPrefix: "",
  },
  poems: {
    key: "poems",
    label: "诗词作品",
    description: "诗词全集",
    kind: "array",
    required: ["title", "content"],
    fields: {
      id: "唯一 ID",
      title: "标题",
      author: "作者",
      dynasty: "朝代/年代",
      date: "创作时间（YYYY-MM-DD，用于排序）",
      content: "正文（可含换行）",
    },
    orderField: "date",
    idPrefix: "poem",
  },
  photos: {
    key: "photos",
    label: "首页照片",
    description: "首页相框/轮播照片",
    kind: "array",
    required: ["src"],
    fields: {
      id: "唯一 ID",
      src: "图片 URL",
      title: "标题",
      desc: "描述",
    },
    orderField: "id",
    idPrefix: "photo",
  },
  stats: {
    key: "stats",
    label: "统计数字",
    description: "首页数据统计卡片",
    kind: "array",
    required: ["label", "value"],
    fields: {
      id: "唯一 ID",
      label: "名称",
      value: "数值（number）",
      suffix: "单位后缀，如 篇",
      color: "Tailwind 色名，如 cyber-blue",
    },
    orderField: "id",
    idPrefix: "stat",
  },
  skills: {
    key: "skills",
    label: "技能雷达",
    description: "技能熟练度（雷达图）",
    kind: "array",
    required: ["name", "level"],
    fields: {
      id: "唯一 ID",
      name: "技能名称",
      level: "熟练度 0-100（number）",
    },
    orderField: "id",
    idPrefix: "skill",
  },
  myskills: {
    key: "myskills",
    label: "技能作品",
    description: "技能条目（名称 + 链接）",
    kind: "array",
    required: ["name", "url"],
    fields: {
      id: "唯一 ID",
      name: "技能名称",
      url: "技能地址/链接",
      description: "描述（可选）",
    },
    orderField: "id",
    idPrefix: "ms",
  },
  quotes: {
    key: "quotes",
    label: "我的思考",
    description: "思考/语录短句",
    kind: "array",
    required: ["text"],
    fields: {
      id: "唯一 ID",
      text: "思考内容",
      author: "时间标注/出处，如 2026年8月",
    },
    orderField: "id",
    idPrefix: "quote",
  },
  works: {
    key: "works",
    label: "文章作品",
    description: "博客文章（详情页按 slug 访问）",
    kind: "array",
    required: ["title", "slug"],
    fields: {
      id: "唯一 ID",
      slug: "URL 友好标识（详情页 /blog/{slug}）",
      title: "标题",
      excerpt: "摘要",
      date: "发布日期 YYYY-MM-DD（用于排序）",
      category: "分类",
      tags: "标签数组 string[]",
      readTime: "阅读时长，如 5 min",
      cover: "封面图片 URL",
      content: "正文 Markdown",
    },
    orderField: "date",
    idPrefix: "work",
  },
  videos: {
    key: "videos",
    label: "视频作品",
    description: "视频条目（Bilibili 嵌入）",
    kind: "array",
    required: ["title"],
    fields: {
      id: "唯一 ID",
      title: "标题",
      category: "分类",
      duration: "时长，如 08:24",
      cover: "封面图片 URL",
      views: "播放量文本，如 12.3万",
      date: "发布日期 YYYY-MM-DD（用于排序）",
      src: "Bilibili 嵌入地址或 BV 号",
    },
    orderField: "date",
    idPrefix: "video",
  },
  albums: {
    key: "albums",
    label: "摄影相册",
    description: "相册（内含 photos 数组）",
    kind: "array",
    required: ["name"],
    fields: {
      id: "唯一 ID",
      name: "相册名称（AboutMe 用于首页相框）",
      cover: "封面图片 URL",
      count: "照片数量（number）",
      photos: "照片数组 [{ id, src, title }]",
    },
    orderField: "id",
    idPrefix: "album",
  },
  softwares: {
    key: "softwares",
    label: "软件作品",
    description: "软件/项目卡片",
    kind: "array",
    required: ["name"],
    fields: {
      id: "唯一 ID",
      name: "作品名称",
      image: "封面图片 URL",
      description: "简介",
      url: "点击跳转地址",
    },
    orderField: "id",
    idPrefix: "sw",
  },
  socialMedia: {
    key: "socialMedia",
    label: "自媒体平台",
    description: "微信公众号/抖音/视频号/小红书/快手二维码",
    kind: "array",
    required: ["name"],
    fields: {
      id: "唯一 ID",
      name: "平台名称",
      icon: "图标 emoji 或图片 URL",
      desc: "描述",
      qr: "二维码图片 URL",
      color: "品牌色 hex，如 #07c160",
    },
    orderField: "id",
    idPrefix: "sm",
  },
  about: {
    key: "about",
    label: "关于我",
    description: "关于我页面的个人资料、社交链接、技能树、履历时间线（单例对象）",
    kind: "object",
    required: [],
    fields: {
      name: "姓名",
      role: "职位/头衔",
      bio: "个人简介",
      avatar: "头像图片 URL",
      socialLinks: "社交链接数组 [{ id, name, url, icon }]",
      skillTree: "SKILL TREE 标签数组 [{ id, name, certificate }]，certificate 为证书图片 URL（空字符串表示未上传）",
      timeline: "履历数组 [{ id, year, title, desc }]",
    },
    orderField: "id",
    idPrefix: "",
  },
};

export const SECTION_KEYS = Object.keys(SECTION_META);

export function getSectionMeta(section: string): SectionMeta | undefined {
  return SECTION_META[section];
}

/** 生成唯一 ID */
export function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${randomBytes(3).toString("hex")}`;
}

/** 允许的跨域响应头（小程序 / H5 / 第三方客户端） */
export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, X-Admin-User, X-Admin-Pass, Authorization",
  "Access-Control-Max-Age": "86400",
};

/** 排序：默认倒序（最新在前）；无 date 的模块按 id 倒序 */
export function sortItems<T extends Record<string, unknown>>(
  items: T[],
  section: string,
  order: "asc" | "desc"
): T[] {
  const field = SECTION_META[section]?.orderField ?? "id";
  const dir = order === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = String(a[field] ?? "");
    const bv = String(b[field] ?? "");
    const cmp = av.localeCompare(bv) || String(a.id ?? "").localeCompare(String(b.id ?? ""));
    return cmp * dir;
  });
}

/** 关键词搜索：匹配条目内任意字符串字段 */
export function matchKeyword(item: Record<string, unknown>, q: string): boolean {
  const k = q.trim().toLowerCase();
  if (!k) return true;
  return Object.values(item).some((v) => {
    if (typeof v === "string") return v.toLowerCase().includes(k);
    if (Array.isArray(v)) return v.some((x) => typeof x === "string" && x.toLowerCase().includes(k));
    return false;
  });
}
