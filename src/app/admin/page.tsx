"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useContent } from "@/lib/ContentContext";
import AdminPanel, { btnGhost } from "@/components/admin/AdminPanel";

export default function AdminHomePage() {
  const {
    content,
    ready,
    syncedFromServer,
    saveStatus,
    saveError,
    reset,
    importContent,
    flush,
  } = useContent();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const cards = [
    {
      href: "/admin/hero",
      label: "首页 · 主屏",
      desc: "标题、简介、头像占位",
      count: 1,
    },
    {
      href: "/admin/poems",
      label: "诗词模块",
      desc: "首页诗词列表",
      count: content.poems.length,
    },
    {
      href: "/admin/photos",
      label: "相框模块",
      desc: "首页相册轮播",
      count: content.photos.length,
    },
    {
      href: "/admin/stats",
      label: "数据面板",
      desc: "文章 / 视频 / 相册 / 访客",
      count: content.stats.length,
    },
    {
      href: "/admin/skills",
      label: "技能雷达",
      desc: "技能项及熟练度",
      count: content.skills.length,
    },
    {
      href: "/admin/quotes",
      label: "随机语录",
      desc: "首页右侧滚动语录",
      count: content.quotes.length,
    },
    {
      href: "/admin/works",
      label: "我的作品",
      desc: "新增 / 编辑 / 删除",
      count: content.works.length,
    },
  ];

  const onExport = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.download = `site-content-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (file: File) => {
    setImportMsg(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const ok = importContent(parsed);
      if (!ok) {
        setImportMsg("导入失败：JSON 结构不符");
        return;
      }
      // 立刻推送到服务端（不等防抖）
      await flush();
      setImportMsg("导入成功，已保存到服务器");
    } catch (e) {
      setImportMsg(`导入失败：${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <AdminPanel
      title="OVERVIEW"
      description={
        syncedFromServer
          ? "所有内容存储在服务器（跨设备同步），编辑后自动保存"
          : "⚠ 当前显示的是本地缓存（未连接到服务器），变更可能不会保存"
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <SaveBadge status={saveStatus} error={saveError} />
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
              if (f) void onImportFile(f);
              if (fileRef.current) fileRef.current.value = "";
            }}
          />
          <button
            onClick={() => {
              if (
                confirm(
                  "确认重置所有内容为初始示例数据？此操作会同步保存到服务器，不可撤销。"
                )
              ) {
                reset();
              }
            }}
            className={btnGhost}
          >
            ⟲ 重置数据
          </button>
        </div>
      }
    >
      {importMsg && (
        <div className="mb-4 text-xs text-cyber-blue font-[family-name:var(--font-mono)] border border-cyber-border px-3 py-2">
          {importMsg}
        </div>
      )}

      {!ready ? (
        <div className="text-gray-500 text-sm font-[family-name:var(--font-mono)]">
          // 加载中...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="cyber-card p-5 group hover:border-cyber-blue/60 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-[family-name:var(--font-orbitron)] text-sm text-cyber-blue group-hover:text-cyber-purple transition-colors">
                  {c.label}
                </h3>
                <span className="text-[10px] text-gray-500 border border-cyber-border px-1.5 py-0.5 font-[family-name:var(--font-mono)]">
                  {c.count}
                </span>
              </div>
              <p className="text-xs text-gray-500">{c.desc}</p>
              <p className="text-[10px] text-gray-600 mt-3 font-[family-name:var(--font-mono)] group-hover:text-cyber-blue transition-colors">
                MANAGE →
              </p>
            </Link>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}

function SaveBadge({
  status,
  error,
}: {
  status: "idle" | "saving" | "saved" | "error" | "unauthorized";
  error: string | null;
}) {
  const map = {
    idle: { text: "● 待编辑", cls: "text-gray-500 border-cyber-border" },
    saving: { text: "● 保存中...", cls: "text-cyber-blue border-cyber-blue/60" },
    saved: { text: "● 已保存", cls: "text-emerald-400 border-emerald-400/60" },
    error: {
      text: `✗ 保存失败${error ? `：${error}` : ""}`,
      cls: "text-cyber-pink border-cyber-pink/60",
    },
    unauthorized: {
      text: "⚠ 未登录，更改未保存",
      cls: "text-yellow-300 border-yellow-300/60",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={`text-[11px] font-[family-name:var(--font-mono)] border px-2 py-1 ${s.cls}`}
      title={error ?? undefined}
    >
      {s.text}
    </span>
  );
}
