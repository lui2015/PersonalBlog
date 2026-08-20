"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import { useAuth } from "@/lib/AuthContext";
import type { Quote } from "@/lib/types";

export default function QuotesPage() {
  const { content, updateSection, saveStatus } = useContent();
  const { authed, ready: authReady } = useAuth();
  const quotes = content.quotes;

  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selected, setSelected] = useState<Quote | null>(null);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  // 编辑表单临时状态
  const [editText, setEditText] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [addText, setAddText] = useState("");
  const [addAuthor, setAddAuthor] = useState("");
  const nextIdRef = useRef(0);

  // 搜索过滤 + 排序
  const filtered = useMemo(() => {
    let result = quotes;
    const k = keyword.trim().toLowerCase();
    if (k) {
      result = result.filter((q) =>
        [q.text, q.author]
          .filter(Boolean)
          .some((s) => s.toLowerCase().includes(k))
      );
    }
    // 按 id 排序（id 越大越新）
    result = [...result].sort((a, b) =>
      sortOrder === "desc" ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)
    );
    return result;
  }, [quotes, keyword, sortOrder]);

  // 选中导航
  const selectedIndex = selected
    ? filtered.findIndex((q) => q.id === selected.id)
    : -1;

  const navigate = (direction: number) => {
    if (filtered.length === 0 || selectedIndex < 0) return;
    const next = (selectedIndex + direction + filtered.length) % filtered.length;
    setSelected(filtered[next]);
  };

  // ---- CRUD 操作 ----

  /** 开始编辑 */
  const startEdit = (q: Quote) => {
    setEditText(q.text);
    setEditAuthor(q.author || "");
    setEditing(q);
  };

  /** 保存编辑 */
  const saveEdit = () => {
    if (!editing) return;
    const text = editText.trim();
    if (!text) return;
    const updated = quotes.map((q) =>
      q.id === editing.id ? { ...q, text, author: editAuthor.trim() } : q
    );
    updateSection("quotes", updated);
    setEditing(null);
    // 同步 selected 引用
    const refreshed = updated.find((q) => q.id === editing.id);
    if (refreshed) setSelected(refreshed);
  };

  /** 删除 */
  const handleDelete = (id: string) => {
    if (!confirm("确定删除这条思考？")) return;
    const updated = quotes.filter((q) => q.id !== id);
    updateSection("quotes", updated);
    if (selected?.id === id) setSelected(null);
    setEditing(null);
  };

  /** 新增 */
  const handleAdd = () => {
    const text = addText.trim();
    if (!text) return;
    nextIdRef.current += 1;
    const newQuote: Quote = {
      id: `n${Date.now()}_${nextIdRef.current}`,
      text,
      author: addAuthor.trim(),
    };
    updateSection("quotes", [...quotes, newQuote]);
    setAddText("");
    setAddAuthor("");
    setShowAddForm(false);
  };

  /** 取消编辑/新增 */
  const cancelEdit = () => {
    setEditing(null);
  };
  const cancelAdd = () => {
    setShowAddForm(false);
    setAddText("");
    setAddAuthor("");
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
          <h1
            className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl text-cyber-green glitch mb-4"
            data-text="MY THOUGHTS"
          >
            MY THOUGHTS
          </h1>
          <p className="text-gray-500">// 我的思考集 · {quotes.length} 条记录</p>
        </motion.div>

        {/* 搜索 + 返回 + 操作按钮 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div className="flex items-center gap-3 self-start flex-wrap">
            <Link
              href="/#quote"
              className="text-sm text-gray-500 hover:text-cyber-green transition-colors font-[family-name:var(--font-mono)]"
            >
              ← 返回首页
            </Link>
            {authReady && authed && (
              <>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-xs px-3 py-1.5 border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/10 transition-all font-[family-name:var(--font-mono)]"
                >
                  + 新增思考
                </button>
                {saveStatus === "saving" && (
                  <span className="text-[11px] text-yellow-400 font-[family-name:var(--font-mono)] animate-pulse">
                    保存中...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-[11px] text-cyber-green font-[family-name:var(--font-mono)]">✓ 已保存</span>
                )}
                <button
                  onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
                  className="text-xs px-3 py-1.5 border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all font-[family-name:var(--font-mono)]"
                  title={sortOrder === "desc" ? "时间倒序（最新在前）" : "时间正序（最早在前）"}
                >
                  {sortOrder === "desc" ? "↓ 最新" : "↑ 最早"}
                </button>
              </>
            )}
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索思考内容 / 年份"
              className="w-full bg-cyber-black/60 border border-cyber-border focus:border-cyber-green outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-[family-name:var(--font-mono)]">
              {filtered.length}/{quotes.length}
            </span>
          </div>
        </div>

        {/* 新增表单 */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="cyber-card hud-corner p-5 space-y-4">
                <h3 className="text-sm text-cyber-green font-[family-name:var(--font-orbitron)]">
                  ◈ NEW THOUGHT
                </h3>
                <textarea
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  placeholder="输入思考内容..."
                  rows={3}
                  autoFocus
                  className="w-full bg-cyber-black/80 border border-cyber-border focus:border-cyber-green outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 resize-none transition-colors"
                />
                <input
                  type="text"
                  value={addAuthor}
                  onChange={(e) => setAddAuthor(e.target.value)}
                  placeholder="年份 / 作者（可选）"
                  className="w-full bg-cyber-black/80 border border-cyber-border focus:border-cyber-green outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelAdd}
                    className="text-xs px-4 py-1.5 border border-cyber-border text-gray-400 hover:text-gray-200 hover:border-gray-400 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!addText.trim()}
                    className="text-xs px-4 py-1.5 border border-cyber-green text-cyber-green hover:bg-cyber-green/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    确认添加
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="cyber-card p-10 text-center text-gray-500 text-sm font-[family-name:var(--font-mono)]">
            // 没有匹配的思考
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((quote, i) => (
              <motion.button
                key={quote.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(quote)}
                className="cyber-card hud-corner p-5 text-left group relative flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-green"
              >
                {/* 登录态：编辑/删除按钮 */}
                {authReady && authed && (
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(quote); }}
                      aria-label="编辑"
                      className="w-6 h-6 flex items-center justify-center text-[10px] border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all"
                      title="编辑"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(quote.id); }}
                      aria-label="删除"
                      className="w-6 h-6 flex items-center justify-center text-[10px] border border-cyber-pink/40 text-cyber-pink/70 hover:bg-cyber-pink/10 hover:border-cyber-pink/70 transition-all"
                      title="删除"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-baseline justify-between mb-2 pr-12">
                  <span className="text-[10px] text-cyber-green/70 font-[family-name:var(--font-mono)]">
                    #{String(i + 1).padStart(3, "0")}
                  </span>
                  <span className="text-xs text-gray-600 shrink-0 ml-2">
                    — {quote.author}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-5 flex-1">
                  {quote.text}
                </p>
                <div className="mt-3 pt-3 border-t border-cyber-border/40 text-[11px] text-gray-600 group-hover:text-cyber-green transition-colors font-[family-name:var(--font-mono)]">
                  点击展开 →
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
              onClick={() => { setSelected(null); setEditing(null); }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative cyber-card hud-corner p-6 sm:p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              >
                {/* 装饰背景 */}
                <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
                  <div className="text-[8px] text-cyber-green leading-none break-all">
                    {"$".repeat(800)}
                  </div>
                </div>

                <div className="relative z-10">
                  <h2 className="font-[family-name:var(--font-orbitron)] text-xs text-cyber-green mb-6 text-center">
                    ◈ THOUGHT DETAIL
                  </h2>

                  {/* 编辑模式 */}
                  {editing && editing.id === selected.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={4}
                        autoFocus
                        className="w-full bg-cyber-black/80 border border-cyber-green/50 focus:border-cyber-green outline-none px-4 py-3 text-base text-gray-200 resize-none transition-colors"
                      />
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        placeholder="年份 / 作者"
                        className="w-full bg-cyber-black/80 border border-cyber-border focus:border-cyber-green outline-none px-4 py-2 text-sm text-gray-200 transition-colors"
                      />
                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          onClick={cancelEdit}
                          className="text-sm px-4 py-1.5 border border-cyber-border text-gray-400 hover:text-gray-200 transition-all"
                        >
                          取消
                        </button>
                        <button
                          onClick={saveEdit}
                          disabled={!editText.trim()}
                          className="text-sm px-4 py-1.5 border border-cyber-green text-cyber-green hover:bg-cyber-green/10 disabled:opacity-30 transition-all"
                        >
                          保存修改
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-base sm:text-lg leading-loose text-gray-200 mb-6">
                        <span className="text-cyber-green mr-2">$</span>
                        {selected.text}
                      </p>
                      <p className="text-sm text-gray-500 text-right mb-2">
                        — {selected.author}
                      </p>

                      {/* 登录态：操作按钮 */}
                      {authReady && authed && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-cyber-border/30">
                          <button
                            onClick={() => startEdit(selected)}
                            className="text-xs px-3 py-1.5 border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all font-[family-name:var(--font-mono)]"
                          >
                            ✎ 编辑
                          </button>
                          <button
                            onClick={() => handleDelete(selected.id)}
                            className="text-xs px-3 py-1.5 border border-cyber-pink/40 text-cyber-pink/70 hover:bg-cyber-pink/10 hover:border-cyber-pink/70 transition-all font-[family-name:var(--font-mono)]"
                          >
                            ✕ 删除
                          </button>
                        </div>
                      )}

                      {filtered.length > 1 && (
                        <div className="mt-6 text-[11px] text-gray-600 font-[family-name:var(--font-mono)] text-center">
                          {selectedIndex + 1} / {filtered.length}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 上一条 / 下一条 */}
                {filtered.length > 1 && (
                  <>
                    <button
                      onClick={() => navigate(-1)}
                      aria-label="上一条"
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/10 transition-all"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => navigate(1)}
                      aria-label="下一条"
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center border border-cyber-green/50 text-cyber-green hover:bg-cyber-green/10 transition-all"
                    >
                      ›
                    </button>
                  </>
                )}

                {/* 关闭 */}
                <button
                  onClick={() => { setSelected(null); setEditing(null); }}
                  aria-label="关闭"
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center border border-cyber-border text-gray-400 hover:text-cyber-pink hover:border-cyber-pink transition-all"
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
