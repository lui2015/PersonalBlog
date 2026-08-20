"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useContent } from "@/lib/ContentContext";
import { btnPrimary, btnGhost, btnDanger } from "@/components/admin/AdminPanel";
import PoemEditorModal from "@/components/admin/PoemEditorModal";
import type { Poem } from "@/lib/types";

export default function PoemsPage() {
  const { authed } = useAuth();
  const { content, updateSection } = useContent();
  const poems = content.poems;

  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selected, setSelected] = useState<Poem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Poem | null>(null);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (poem: Poem) => {
    setEditing(poem);
    setEditorOpen(true);
  };
  const handleSave = (poem: Poem) => {
    const exists = poems.some((p) => p.id === poem.id);
    const next = exists
      ? poems.map((p) => (p.id === poem.id ? poem : p))
      : [...poems, poem];
    updateSection("poems", next);
    setEditorOpen(false);
  };
  const handleDelete = (id: string) => {
    if (!confirm("确定删除该诗词？")) return;
    updateSection(
      "poems",
      poems.filter((p) => p.id !== id)
    );
    setEditorOpen(false);
    setSelected((prev) => (prev?.id === id ? null : prev));
  };

  // 简易搜索 + 排序：标题 / 作者 / 时间 / 正文 任意命中，默认按时间倒序
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let result = poems;
    if (k) {
      result = result.filter((p) =>
        [p.title, p.author, p.date, p.content]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(k))
      );
    }
    result = [...result].sort((a, b) => {
      const cmp = (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id);
      return sortOrder === "desc" ? cmp : -cmp;
    });
    return result;
  }, [poems, keyword, sortOrder]);

  // 选中诗词的前后导航（基于过滤后的列表）
  const selectedIndex = selected
    ? filtered.findIndex((p) => p.id === selected.id)
    : -1;

  const navigate = (direction: number) => {
    if (filtered.length === 0 || selectedIndex < 0) return;
    const next = (selectedIndex + direction + filtered.length) % filtered.length;
    setSelected(filtered[next]);
  };

  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1
              className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl text-cyber-blue glitch mb-4"
              data-text="POETRY"
            >
              POETRY
            </h1>
            {authed && (
              <button onClick={openNew} className={btnPrimary + " mb-4"}>
                + 新增诗词
              </button>
            )}
          </div>
          <p className="text-gray-500">// 收录的诗词全集</p>
        </motion.div>

        {/* 搜索 + 返回 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <Link
            href="/#poems"
            className="text-sm text-gray-500 hover:text-cyber-blue transition-colors font-[family-name:var(--font-mono)] self-start"
          >
            ← 返回首页
          </Link>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
              className="text-xs px-3 py-2 border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all font-[family-name:var(--font-mono)] whitespace-nowrap shrink-0"
              title={sortOrder === "desc" ? "时间倒序（最新在前）" : "时间正序（最早在前）"}
            >
              {sortOrder === "desc" ? "↓ 最新" : "↑ 最早"}
            </button>
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索 标题 / 作者 / 时间 / 正文"
                className="w-full bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-[family-name:var(--font-mono)]">
                {filtered.length}/{poems.length}
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="cyber-card p-10 text-center text-gray-500 text-sm font-[family-name:var(--font-mono)]">
            // 没有匹配的诗词
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((poem, i) => (
              <motion.button
                key={poem.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(poem)}
                className="cyber-card hud-corner p-5 text-left group relative flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-blue"
              >
                {authed && (
                  <div className="absolute top-2 right-2 z-20 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(poem);
                      }}
                      className={btnGhost + " !py-1 !px-2"}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(poem.id);
                      }}
                      className={btnDanger + " !py-1 !px-2"}
                    >
                      删除
                    </button>
                  </div>
                )}
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg text-cyber-purple font-medium group-hover:text-cyber-blue transition-colors">
                    {poem.title}
                  </h3>
                  <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)] shrink-0 ml-2">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {poem.date} {poem.author}
                </p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line line-clamp-4 flex-1">
                  {poem.content}
                </p>
                <div className="mt-3 pt-3 border-t border-cyber-border/40 text-[11px] text-gray-600 group-hover:text-cyber-blue transition-colors font-[family-name:var(--font-mono)]">
                  点击查看全文 →
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* 详情 Modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/95 backdrop-blur-sm p-4"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative cyber-card hud-corner p-6 sm:p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              >
                {/* 数字雨背景装饰 */}
                <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
                  <div className="text-[8px] text-cyber-green leading-none break-all">
                    {"01".repeat(800)}
                  </div>
                </div>

                <div className="relative z-10 text-center">
                  <h2 className="font-[family-name:var(--font-orbitron)] text-xs text-cyber-blue mb-4">
                    ◈ POETRY DETAIL
                  </h2>
                  <h3 className="text-2xl sm:text-3xl text-cyber-purple mb-2 font-medium">
                    {selected.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">
                    {selected.date} {selected.author}
                  </p>
                  <div className="text-base sm:text-lg leading-loose text-gray-200 whitespace-pre-line">
                    {selected.content}
                  </div>

                  {filtered.length > 1 && (
                    <div className="mt-8 text-[11px] text-gray-600 font-[family-name:var(--font-mono)]">
                      {selectedIndex + 1} / {filtered.length}
                    </div>
                  )}
                </div>

                {/* 上一首 / 下一首 */}
                {filtered.length > 1 && (
                  <>
                    <button
                      onClick={() => navigate(-1)}
                      aria-label="上一首"
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => navigate(1)}
                      aria-label="下一首"
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* 关闭 */}
                <button
                  onClick={() => setSelected(null)}
                  aria-label="关闭"
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center border border-cyber-border text-gray-400 hover:text-cyber-pink hover:border-cyber-pink transition-all"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <PoemEditorModal
          open={editorOpen}
          initial={editing}
          onClose={() => setEditorOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
