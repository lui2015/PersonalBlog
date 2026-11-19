import { DEFAULT_CONTENT } from "./defaultContent";
import type {
  MiniProgramTool,
  MiniProgramToolGroup,
  MiniProgramToolsConfig,
} from "./types";

/**
 * 小程序工具配置的归一化与只读视图。
 * 纯函数、无服务端依赖，ContentContext（客户端）与 server/content（服务端）共用。
 */

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asBool(v: unknown, fallback = true): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
}

export function normalizeTool(raw: unknown, index: number): MiniProgramTool {
  const o = asObject(raw);
  return {
    id: asString(o.id) || `tool_${index}`,
    name: asString(o.name, "未命名工具"),
    desc: asString(o.desc),
    icon: asString(o.icon, "◆"),
    badge: asString(o.badge),
    route: asString(o.route),
    enabled: asBool(o.enabled, true),
  };
}

export function normalizeGroup(
  raw: unknown,
  index: number
): MiniProgramToolGroup {
  const o = asObject(raw);
  const tools = Array.isArray(o.tools) ? o.tools : [];
  return {
    id: asString(o.id) || `group_${index}`,
    name: asString(o.name, "GROUP"),
    subtitle: asString(o.subtitle),
    color: asString(o.color, "#00f0ff"),
    enabled: asBool(o.enabled, true),
    tools: tools.map(normalizeTool),
  };
}

/** 兼容旧数据：缺字段时补默认值，脏数据不会让后台页面崩掉 */
export function normalizeMiniProgramTools(
  raw: unknown
): MiniProgramToolsConfig {
  const base = DEFAULT_CONTENT.miniProgramTools;
  const o = asObject(raw);
  const groups = Array.isArray(o.groups) ? o.groups : base.groups;
  return {
    title: asString(o.title, base.title),
    enabled: asBool(o.enabled, base.enabled),
    groups: groups.map(normalizeGroup),
  };
}

export interface PublicMiniProgramTools {
  title: string;
  enabled: boolean;
  groups: MiniProgramToolGroup[];
  totalGroups: number;
  totalTools: number;
}

/**
 * 小程序端只读视图：总开关关闭、分组隐藏、工具隐藏的项一律不返回。
 * 小程序直接渲染 groups 即可实现「按配置显示 / 隐藏工具」。
 */
export function visibleMiniProgramTools(
  config: MiniProgramToolsConfig
): PublicMiniProgramTools {
  const groups = config.enabled
    ? config.groups
        .filter((g) => g.enabled)
        .map((g) => ({ ...g, tools: g.tools.filter((t) => t.enabled) }))
        .filter((g) => g.tools.length > 0)
    : [];
  return {
    title: config.title,
    enabled: config.enabled,
    groups,
    totalGroups: groups.length,
    totalTools: groups.reduce((n, g) => n + g.tools.length, 0),
  };
}

/** 后台新增分组 / 工具时生成唯一 ID（客户端可用，不依赖 node:crypto） */
export function makeMiniId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
