"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "@/lib/ContentContext";
import AdminPanel, {
  btnDanger,
  btnGhost,
  btnPrimary,
  inputClass,
} from "@/components/admin/AdminPanel";
import {
  makeMiniId,
  normalizeMiniProgramTools,
  visibleMiniProgramTools,
} from "@/lib/miniProgramTools";
import type {
  MiniProgramTool,
  MiniProgramToolGroup,
  MiniProgramToolsConfig,
} from "@/lib/types";

const TOOLS_ENDPOINT = "/api/miniprogram/tools";
const CONFIG_ENDPOINT = "/api/open/miniProgramTools";

export default function MiniProgramToolsPage() {
  const { content, ready, updateSection, saveStatus } = useContent();
  const [draft, setDraft] = useState<MiniProgramToolsConfig>(() =>
    normalizeMiniProgramTools(content.miniProgramTools)
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (ready) setDraft(normalizeMiniProgramTools(content.miniProgramTools));
  }, [ready, content.miniProgramTools]);

  const visible = useMemo(() => visibleMiniProgramTools(draft), [draft]);
  const fullUrl = origin ? origin + TOOLS_ENDPOINT : TOOLS_ENDPOINT;

  const patchConfig = (patch: Partial<MiniProgramToolsConfig>) =>
    setDraft((d) => ({ ...d, ...patch }));

  const patchGroup = (gi: number, patch: Partial<MiniProgramToolGroup>) =>
    setDraft((d) => ({
      ...d,
      groups: d.groups.map((g, i) => (i === gi ? { ...g, ...patch } : g)),
    }));

  const patchTool = (
    gi: number,
    ti: number,
    patch: Partial<MiniProgramTool>
  ) =>
    setDraft((d) => ({
      ...d,
      groups: d.groups.map((g, i) =>
        i === gi
          ? {
              ...g,
              tools: g.tools.map((t, j) =>
                j === ti ? { ...t, ...patch } : t
              ),
            }
          : g
      ),
    }));

  const moveGroup = (gi: number, delta: number) =>
    setDraft((d) => ({ ...d, groups: move(d.groups, gi, gi + delta) }));

  const removeGroup = (gi: number) => {
    if (!confirm(`确认删除分组「${draft.groups[gi].name}」及其全部工具？`)) return;
    setDraft((d) => ({ ...d, groups: d.groups.filter((_, i) => i !== gi) }));
  };

  const addGroup = () =>
    setDraft((d) => ({
      ...d,
      groups: [
        ...d.groups,
        {
          id: makeMiniId("group"),
          name: "NEW",
          subtitle: "新分组",
          color: "#00f0ff",
          enabled: true,
          tools: [],
        },
      ],
    }));

  const addTool = (gi: number) =>
    setDraft((d) => ({
      ...d,
      groups: d.groups.map((g, i) =>
        i === gi
          ? {
              ...g,
              tools: [
                ...g.tools,
                {
                  id: makeMiniId("tool"),
                  name: "新工具",
                  desc: "",
                  icon: "◆",
                  badge: "",
                  route: "",
                  enabled: true,
                },
              ],
            }
          : g
      ),
    }));

  const moveTool = (gi: number, ti: number, delta: number) =>
    setDraft((d) => ({
      ...d,
      groups: d.groups.map((g, i) =>
        i === gi ? { ...g, tools: move(g.tools, ti, ti + delta) } : g
      ),
    }));

  const removeTool = (gi: number, ti: number) => {
    const name = draft.groups[gi].tools[ti].name;
    if (!confirm(`确认删除工具「${name}」？`)) return;
    setDraft((d) => ({
      ...d,
      groups: d.groups.map((g, i) =>
        i === gi ? { ...g, tools: g.tools.filter((_, j) => j !== ti) } : g
      ),
    }));
  };

  const onSave = () => {
    const cfg = normalizeMiniProgramTools(draft);
    setDraft(cfg);
    updateSection("miniProgramTools", cfg);
    setMsg("配置已提交，正在同步到服务器；保存后小程序端接口即时生效");
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setMsg("复制失败，请手动复制页面上的接口地址");
    }
  };

  const onExport = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mini-program-tools-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const outer = parsed as Record<string, unknown> | null;
      const raw = outer?.miniProgramTools ?? parsed;
      const cfg = normalizeMiniProgramTools(raw);
      if (!cfg.groups.length) {
        setMsg("导入失败：未识别到 groups 分组数据");
        return;
      }
      setDraft(cfg);
      setMsg("已导入编辑区，点击「保存配置」后生效");
    } catch (e) {
      setMsg(`导入失败：${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <AdminPanel
      title="MINI PROGRAM TOOLS"
      description="配置小程序工具列表：按分组 / 单个工具控制显示或隐藏，保存后小程序接口即时生效"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={saveStatus} />
          <button onClick={onSave} className={btnPrimary}>
            ⤴ 保存配置
          </button>
          <button onClick={onCopy} className={btnGhost}>
            {copied ? "✓ 已复制" : "⧉ 复制接口地址"}
          </button>
          <button onClick={onExport} className={btnGhost}>
            ↧ 导出 JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className={btnGhost}
          >
            ↥ 导入 JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onImport(f);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
        </div>
      }
    >
      {msg && (
        <div className="mb-4 text-xs text-cyber-blue font-[family-name:var(--font-mono)] border border-cyber-border px-3 py-2">
          {msg}
        </div>
      )}

      {/* 基础配置 */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end mb-4 p-4 border border-cyber-border/50">
        <label className="block">
          <span className="block text-[11px] text-cyber-blue mb-1.5 font-[family-name:var(--font-mono)] tracking-widest">
            [列表标题]
          </span>
          <input
            value={draft.title}
            onChange={(e) => patchConfig({ title: e.target.value })}
            className={inputClass}
            placeholder="TOOL LIST"
          />
        </label>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 font-[family-name:var(--font-mono)]">
            总开关
          </span>
          <Toggle
            checked={draft.enabled}
            onChange={(v) => patchConfig({ enabled: v })}
          />
        </div>
      </div>

      {/* 统计与提示 */}
      <div className="flex flex-wrap items-center gap-3 mb-5 text-[11px] font-[family-name:var(--font-mono)]">
        <span className="border border-cyber-blue/50 text-cyber-blue px-2 py-1">
          可见分组 {visible.totalGroups} / {draft.groups.length}
        </span>
        <span className="border border-cyber-blue/50 text-cyber-blue px-2 py-1">
          可见工具 {visible.totalTools} /{" "}
          {draft.groups.reduce((n, g) => n + g.tools.length, 0)}
        </span>
        <span className="text-gray-600">
          隐藏的分组 / 工具不会出现在小程序接口里
        </span>
      </div>

      <div className="mb-5 text-[11px] text-yellow-300/80 border border-yellow-300/30 px-3 py-2 font-[family-name:var(--font-mono)]">
        ⚠ 当前只预置了已确认的 2 个分组 / 3 个工具（工作日计算器、大事件倒计时、尺子）。若小程序共有 6 个分组，请点下方「新增分组」补齐，或用「导入 JSON」一次性录入。
      </div>

      {/* 分组列表 */}
      {draft.groups.map((group, gi) => (
        <div
          key={group.id}
          className="border border-cyber-border/60 p-4 mb-4"
          style={{ borderLeftColor: group.color, borderLeftWidth: 3 }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-cyber-border/40">
            <span className="text-[11px] text-gray-600 font-[family-name:var(--font-mono)] w-8">
              {String(gi + 1).padStart(2, "0")}
            </span>
            <input
              value={group.name}
              onChange={(e) => patchGroup(gi, { name: e.target.value })}
              className={inputClass + " w-28"}
              placeholder="WORK"
              aria-label="分组名"
            />
            <input
              value={group.subtitle}
              onChange={(e) => patchGroup(gi, { subtitle: e.target.value })}
              className={inputClass + " flex-1 min-w-[120px]"}
              placeholder="分组副标题"
              aria-label="分组副标题"
            />
            <div className="flex items-center gap-1">
              <span
                className="w-4 h-4 border border-cyber-border shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <input
                value={group.color}
                onChange={(e) => patchGroup(gi, { color: e.target.value })}
                className={inputClass + " w-28"}
                placeholder="#00f0ff"
                aria-label="主题色"
              />
            </div>
            <Toggle
              checked={group.enabled}
              onChange={(v) => patchGroup(gi, { enabled: v })}
            />
            <button
              onClick={() => moveGroup(gi, -1)}
              className={btnGhost}
              disabled={gi === 0}
              title="上移"
            >
              ↑
            </button>
            <button
              onClick={() => moveGroup(gi, 1)}
              className={btnGhost}
              disabled={gi === draft.groups.length - 1}
              title="下移"
            >
              ↓
            </button>
            <button
              onClick={() => removeGroup(gi)}
              className={btnDanger}
              title="删除分组"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {group.tools.map((tool, ti) => (
              <div
                key={tool.id}
                className={`bg-cyber-black/40 border border-cyber-border/40 p-3 ${
                  tool.enabled ? "" : "opacity-50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
                    TOOL {String(ti + 1).padStart(2, "0")} · {tool.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <Toggle
                      checked={tool.enabled}
                      onChange={(v) => patchTool(gi, ti, { enabled: v })}
                    />
                    <button
                      onClick={() => moveTool(gi, ti, -1)}
                      className={btnGhost}
                      disabled={ti === 0}
                      title="上移"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveTool(gi, ti, 1)}
                      className={btnGhost}
                      disabled={ti === group.tools.length - 1}
                      title="下移"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeTool(gi, ti)}
                      className={btnDanger}
                      title="删除工具"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    value={tool.name}
                    onChange={(e) =>
                      patchTool(gi, ti, { name: e.target.value })
                    }
                    className={inputClass}
                    placeholder="工具名"
                    aria-label="工具名"
                  />
                  <input
                    value={tool.icon}
                    onChange={(e) =>
                      patchTool(gi, ti, { icon: e.target.value })
                    }
                    className={inputClass}
                    placeholder="图标 emoji"
                    aria-label="图标"
                  />
                  <input
                    value={tool.badge ?? ""}
                    onChange={(e) =>
                      patchTool(gi, ti, { badge: e.target.value })
                    }
                    className={inputClass}
                    placeholder="角标"
                    aria-label="角标"
                  />
                  <input
                    value={tool.route ?? ""}
                    onChange={(e) =>
                      patchTool(gi, ti, { route: e.target.value })
                    }
                    className={inputClass}
                    placeholder="小程序页面路径"
                    aria-label="页面路径"
                  />
                </div>
                <textarea
                  value={tool.desc}
                  onChange={(e) =>
                    patchTool(gi, ti, { desc: e.target.value })
                  }
                  className={inputClass + " mt-2 resize-y min-h-[56px]"}
                  placeholder="工具简介"
                  aria-label="工具简介"
                />
              </div>
            ))}
            {group.tools.length === 0 && (
              <p className="text-[11px] text-gray-600 font-[family-name:var(--font-mono)] py-2">
                // 该分组暂无工具，小程序端不会展示此分组
              </p>
            )}
            <button onClick={() => addTool(gi)} className={btnGhost}>
              + 新增工具
            </button>
          </div>
        </div>
      ))}

      <button onClick={addGroup} className={btnGhost}>
        + 新增分组
      </button>

      {/* 接口说明 */}
      <div className="mt-8 pt-5 border-t border-cyber-border/40">
        <h3 className="font-[family-name:var(--font-orbitron)] text-sm text-cyber-blue mb-3">
          ◆ 对外接口
        </h3>
        <div className="space-y-2 text-[11px] font-[family-name:var(--font-mono)] text-gray-400">
          <div>
            <span className="text-cyber-blue">GET</span> {fullUrl}
            <span className="text-gray-600">
              {" "}
              · 公开只读，默认只返回 enabled 的分组与工具，小程序直接渲染 groups
            </span>
          </div>
          <div>
            <span className="text-cyber-blue">GET</span> {CONFIG_ENDPOINT}
            <span className="text-gray-600">
              {" "}
              · 完整配置（含隐藏项），调试与后台核对用；PUT 需管理员凭据
            </span>
          </div>
          <div>
            <span className="text-gray-600">
              调试全量：{TOOLS_ENDPOINT}?all=1
            </span>
          </div>
        </div>
        <pre className="mt-3 bg-cyber-black/60 border border-cyber-border p-3 text-[11px] text-gray-400 overflow-x-auto font-[family-name:var(--font-mono)]">
          {JSON.stringify(
            {
              ok: true,
              visibleOnly: true,
              title: draft.title,
              enabled: draft.enabled,
              totalGroups: visible.totalGroups,
              totalTools: visible.totalTools,
              groups: visible.groups.slice(0, 1).map((g) => ({
                id: g.id,
                name: g.name,
                subtitle: g.subtitle,
                color: g.color,
                tools: g.tools.map((t) => ({
                  id: t.id,
                  name: t.name,
                  desc: t.desc,
                  icon: t.icon,
                  enabled: t.enabled,
                })),
              })),
            },
            null,
            2
          )}
        </pre>
      </div>
    </AdminPanel>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      title={checked ? "当前显示，点击隐藏" : "当前隐藏，点击显示"}
      className={`flex items-center gap-2 px-2 py-1 border text-[11px] font-[family-name:var(--font-mono)] transition-all shrink-0 ${
        checked
          ? "border-cyber-blue/70 text-cyber-blue bg-cyber-blue/10"
          : "border-cyber-border text-gray-500 hover:text-gray-300"
      }`}
    >
      <span
        className={`relative w-8 h-4 rounded-full transition-colors ${
          checked ? "bg-cyber-blue/60" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-cyber-black transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      {checked ? "显示" : "隐藏"}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: "idle" | "saving" | "saved" | "error" | "unauthorized";
}) {
  const map = {
    idle: { text: "● 待编辑", cls: "text-gray-500 border-cyber-border" },
    saving: { text: "● 保存中...", cls: "text-cyber-blue border-cyber-blue/60" },
    saved: { text: "● 已保存", cls: "text-emerald-400 border-emerald-400/60" },
    error: { text: "✗ 保存失败", cls: "text-cyber-pink border-cyber-pink/60" },
    unauthorized: {
      text: "⚠ 未登录",
      cls: "text-yellow-300 border-yellow-300/60",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={`text-[11px] font-[family-name:var(--font-mono)] border px-2 py-1 ${s.cls}`}
    >
      {s.text}
    </span>
  );
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from === to) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
