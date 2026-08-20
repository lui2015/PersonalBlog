"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import { useAuth } from "@/lib/AuthContext";
import type { Work } from "@/lib/types";
import CyberButton from "@/components/ui/CyberButton";
import WorkEditorModal from "@/components/admin/WorkEditorModal";
import { btnPrimary } from "@/components/admin/AdminPanel";

export default function BlogPage() {
  const { content, ready, updateSection } = useContent();
  const { authed } = useAuth();

  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const sortedWorks = [...content.works].sort((a, b) => {
    const cmp = (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id);
    return sortOrder === "desc" ? cmp : -cmp;
  });

  const handleSaveWork = (work: Work) => {
    const exists = content.works.some((w) => w.id === work.id);
    const next = exists
      ? content.works.map((w) => (w.id === work.id ? work : w))
      : [work, ...content.works];
    updateSection("works", next);
    setWorkModalOpen(false);
  };

  const handleDeleteWork = (id: string) => {
    if (!confirm("确定删除这篇文章吗？此操作不可撤销。")) return;
    updateSection(
      "works",
      content.works.filter((w) => w.id !== id)
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-16">
        <header className="mb-10 text-center">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-cyber-pink">
            BLOG
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-orbitron)] text-4xl text-cyber-blue sm:text-5xl">
            文章
          </h1>
          <p className="mt-3 text-gray-400">思考、记录与分享</p>
        </header>

        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
            className="text-xs px-3 py-2 border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all font-[family-name:var(--font-mono)] whitespace-nowrap"
            title={sortOrder === "desc" ? "时间倒序（最新在前）" : "时间正序（最早在前）"}
          >
            {sortOrder === "desc" ? "↓ 最新" : "↑ 最早"}
          </button>
          {authed && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:inline">管理员模式：可直接添加 / 编辑 / 删除文章</span>
              <button
                className={btnPrimary}
                onClick={() => {
                  setEditingWork(null);
                  setWorkModalOpen(true);
                }}
              >
                + 新增文章
              </button>
            </div>
          )}
        </div>

        {!ready ? (
          <div className="py-20 text-center text-gray-500">加载中…</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedWorks.map((work) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <Link
                  href={`/blog/${work.slug}`}
                  className="block overflow-hidden rounded-lg border border-cyber-border bg-cyber-black/50 transition-all hover:border-cyber-blue hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={work.cover}
                      alt={work.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded bg-cyber-pink/90 px-2 py-0.5 text-xs font-semibold text-cyber-black">
                      {work.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-blue line-clamp-1">
                      {work.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">{work.excerpt}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{work.date}</span>
                      <span>{work.readTime}</span>
                    </div>
                  </div>
                </Link>

                {authed && (
                  <div className="absolute right-2 top-2 z-10 flex gap-1">
                    <button
                      onClick={() => {
                        setEditingWork(work);
                        setWorkModalOpen(true);
                      }}
                      className="rounded bg-cyber-black/80 px-2 py-1 text-xs text-cyber-blue transition-colors hover:bg-cyber-blue hover:text-cyber-black"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteWork(work.id)}
                      className="rounded bg-cyber-black/80 px-2 py-1 text-xs text-cyber-pink transition-colors hover:bg-cyber-pink hover:text-cyber-black"
                    >
                      删除
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <CyberButton href="/">返回首页</CyberButton>
        </div>
      </div>

      <WorkEditorModal
        open={workModalOpen}
        initial={editingWork}
        onClose={() => setWorkModalOpen(false)}
        onSave={handleSaveWork}
      />
    </main>
  );
}
