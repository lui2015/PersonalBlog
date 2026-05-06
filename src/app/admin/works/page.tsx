"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import AdminPanel, { btnPrimary, btnGhost, btnDanger } from "@/components/admin/AdminPanel";
import type { Work } from "@/lib/types";
import { useRouter } from "next/navigation";

function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return base || `work-${Date.now()}`;
}

export default function WorksAdminPage() {
  const { content, updateSection } = useContent();
  const router = useRouter();

  const createNew = () => {
    const id = `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newWork: Work = {
      id,
      slug: `untitled-${Date.now()}`,
      title: "未命名作品",
      excerpt: "",
      date: new Date().toISOString().slice(0, 10),
      category: "技术",
      tags: [],
      readTime: "5 min",
      cover: `https://picsum.photos/seed/${Math.random()
        .toString(36)
        .slice(2, 8)}/800/400`,
      content: "## 正文\n\n请在此处编辑内容。",
    };
    updateSection("works", [newWork, ...content.works]);
    router.push(`/admin/works/${id}`);
  };

  const removeWork = (id: string) => {
    if (!confirm("确认删除该作品？此操作不可撤销。")) return;
    updateSection(
      "works",
      content.works.filter((w) => w.id !== id)
    );
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= content.works.length) return;
    const next = [...content.works];
    [next[index], next[target]] = [next[target], next[index]];
    updateSection("works", next);
  };

  // 工具：避免 slug 重复显示问题，但不强制重命名
  void makeSlug;

  return (
    <AdminPanel
      title="WORKS · 我的作品"
      description="管理作品集：标题、封面、标签、正文（Markdown）"
      action={
        <button onClick={createNew} className={btnPrimary}>
          + 新建作品
        </button>
      }
    >
      {content.works.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm font-[family-name:var(--font-mono)]">
          // 暂无作品，点击右上角「新建作品」开始创作
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.works.map((w, i) => (
            <motion.div
              key={w.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="cyber-card p-4 group"
            >
              <div className="flex gap-4">
                <div className="relative w-28 h-20 shrink-0 overflow-hidden rounded border border-cyber-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={w.cover}
                    alt={w.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 scanlines opacity-50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 border border-cyber-purple/50 text-cyber-purple">
                      {w.category}
                    </span>
                    <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
                      {w.date} · {w.readTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-200 line-clamp-1">
                    {w.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {w.excerpt || "（无摘要）"}
                  </p>
                  <div className="text-[10px] text-gray-600 mt-1 font-[family-name:var(--font-mono)]">
                    /blog/{w.slug}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-cyber-border/30">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className={`${btnGhost} disabled:opacity-30 disabled:cursor-not-allowed`}
                  title="上移"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === content.works.length - 1}
                  className={`${btnGhost} disabled:opacity-30 disabled:cursor-not-allowed`}
                  title="下移"
                >
                  ↓
                </button>
                <Link
                  href={`/blog/${w.slug}`}
                  target="_blank"
                  className={btnGhost}
                >
                  预览
                </Link>
                <Link href={`/admin/works/${w.id}`} className={btnGhost}>
                  编辑
                </Link>
                <button onClick={() => removeWork(w.id)} className={btnDanger}>
                  删除
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
