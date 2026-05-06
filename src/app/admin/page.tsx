"use client";

import Link from "next/link";
import { useContent } from "@/lib/ContentContext";
import AdminPanel, { btnGhost } from "@/components/admin/AdminPanel";

export default function AdminHomePage() {
  const { content, ready, reset } = useContent();

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

  return (
    <AdminPanel
      title="OVERVIEW"
      description="所有内容均存储于本地浏览器（localStorage），可随时导出或重置"
      action={
        <button
          onClick={() => {
            if (confirm("确认重置所有内容为初始示例数据？此操作不可撤销。")) {
              reset();
            }
          }}
          className={btnGhost}
        >
          ⟲ 重置数据
        </button>
      }
    >
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
