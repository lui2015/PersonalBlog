"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import type { MySkill } from "@/lib/types";

const API = "/api/content";

function uid() {
  return `ms${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** 复制文本到剪贴板：优先用 Clipboard API，失败退化到 execCommand。返回是否成功。 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 退化 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.width = "1px";
    ta.style.height = "1px";
    ta.style.padding = "0";
    ta.style.border = "none";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/* ── Modal: 新增 / 编辑 ── */
function SkillModal({
  open,
  skill,
  onClose,
  onSave,
}: {
  open: boolean;
  skill: MySkill | null; // null = 新增
  onClose: () => void;
  onSave: (data: Pick<MySkill, "name" | "url" | "description">) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setUrl(skill.url);
      setDesc(skill.description ?? "");
    } else {
      setName("");
      setUrl("");
      setDesc("");
    }
  }, [skill]);

  if (!open) return null;

  const isEdit = !!skill;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="cyber-card w-full max-w-md mx-4 p-8"
        >
          <h3 className="font-[family-name:var(--font-orbitron)] text-xl text-cyber-blue mb-6">
            {isEdit ? "编辑技能" : "新增技能"}
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-[family-name:var(--font-mono)]">
                技能名称
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：React 开发"
                className="w-full bg-cyber-black/60 border border-cyber-border rounded px-4 py-2.5 text-white placeholder-gray-600 focus:border-cyber-blue focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-[family-name:var(--font-mono)]">
                技能地址 / 链接
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/skill"
                type="url"
                className="w-full bg-cyber-black/60 border border-cyber-border rounded px-4 py-2.5 text-white placeholder-gray-600 focus:border-cyber-blue focus:outline-none transition-colors font-[family-name:var(--font-mono)] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-[family-name:var(--font-mono)]">
                技能描述
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="简要描述该技能的用途或特点（可选）"
                rows={3}
                className="w-full bg-cyber-black/60 border border-cyber-border rounded px-4 py-2.5 text-white placeholder-gray-600 focus:border-cyber-blue focus:outline-none transition-colors resize-none text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-5 py-2 text-gray-400 hover:text-white border border-cyber-border rounded hover:border-gray-500 transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (!name.trim() || !url.trim()) return;
                onSave({ name: name.trim(), url: url.trim(), description: desc.trim() || undefined });
              }}
              disabled={!name.trim() || !url.trim()}
              className="px-5 py-2 bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/50 rounded hover:bg-cyber-purple hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isEdit ? "保存修改" : "确认添加"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Skill Card ── */
function SkillCard({
  skill,
  index,
  canEdit,
  onEdit,
  onDelete,
}: {
  skill: MySkill;
  index: number;
  canEdit: boolean;
  onEdit: (s: MySkill) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyErr, setCopyErr] = useState(false);

  const copyUrl = async () => {
    const ok = await copyToClipboard(skill.url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      setCopyErr(true);
      setTimeout(() => setCopyErr(false), 1500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ delay: index * 0.06 }}
      className="cyber-card group relative overflow-hidden"
    >
      {/* Index badge */}
      <div className="absolute top-4 right-4 text-xs font-[family-name:var(--font-mono)] text-cyber-border group-hover:text-cyber-blue/50 transition-colors">
        #{String(index + 1).padStart(2, "0")}
      </div>

      <div className="flex items-start gap-4 pt-6 pb-7 px-6">
        {/* Icon */}
        <div className="shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-cyber-purple/20 to-cyber-blue/20 border border-cyber-border flex items-center justify-center">
          <span className="text-xl">◆</span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate shrink-0">
              {skill.name}
            </h3>
            {skill.description && (
              <span className="text-sm text-gray-400 truncate">
                {skill.description}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <a
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyber-blue hover:text-cyber-purple transition-colors font-[family-name:var(--font-mono)] break-all underline decoration-dotted underline-offset-4 min-w-0"
            >
              {skill.url}
            </a>
            <button
              onClick={copyUrl}
              className="shrink-0 p-1.5 text-xs text-gray-500 hover:text-cyber-green border border-transparent hover:border-cyber-green/40 rounded transition-all active:scale-90"
              title={copied ? "已复制" : copyErr ? "复制失败，请手动复制" : "复制链接"}
            >
              {copied ? "✓" : copyErr ? "✗" : "⧉"}
            </button>
          </div>
        </div>

        {/* Actions (admin only) */}
        {canEdit && (
          <div className="shrink-0 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(skill)}
              className="p-1.5 text-xs text-gray-500 hover:text-cyber-blue border border-transparent hover:border-cyber-border rounded transition-all"
              title="编辑"
            >
              ✎
            </button>
            {!confirmDel ? (
              <button
                onClick={() => setConfirmDel(true)}
                className="p-1.5 text-xs text-gray-500 hover:text-red-400 border border-transparent hover:border-red-400/30 rounded transition-all"
                title="删除"
              >
                ✕
              </button>
            ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => setConfirmDel(false)}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-white border border-cyber-border rounded"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      onDelete(skill.id);
                      setConfirmDel(false);
                    }}
                    className="px-2 py-1 text-xs text-red-400 hover:bg-red-400/10 border border-red-400/30 rounded"
                  >
                    确认
                  </button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Bottom glow line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-cyber-border to-transparent" />
    </motion.div>
  );
}

/* ── Page ── */
export default function SkillsPage() {
  const { authed } = useAuth();
  const [skills, setSkills] = useState<MySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MySkill | null>(null);

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const sortedSkills = [...skills].sort((a, b) =>
    sortOrder === "desc" ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)
  );

  // Load
  const load = useCallback(async () => {
    try {
      const res = await fetch(API, { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = (await res.json()) as { myskills?: MySkill[] };
        setSkills(Array.isArray(data.myskills) ? data.myskills : []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Save (PUT full content — only update myskills)
  const save = useCallback(
    async (next: MySkill[]) => {
      setSaving(true);
      try {
        const res = await fetch(API, {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...((await (await fetch(API)).json()) as Record<string, unknown>), myskills: next }),
        });
        if (res.ok) setSkills(next);
      } catch {
        /* ignore */
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const handleAdd = async (data: Pick<MySkill, "name" | "url" | "description">) => {
    await save([...skills, { id: uid(), ...data }]);
    setModalOpen(false);
  };

  const handleEdit = async (data: Pick<MySkill, "name" | "url" | "description">) => {
    if (!editing) return;
    await save(skills.map((s) => (s.id === editing.id ? { ...s, ...data } : s)));
    setEditing(null);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await save(skills.filter((s) => s.id !== id));
  };

  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1
            className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl text-cyber-blue glitch mb-4"
            data-text="MY SKILLS"
          >
            MY SKILLS
          </h1>
          <p className="text-gray-500">// 我的技能 · 查看与管理</p>
        </motion.div>

        {/* Toolbar: 排序 + 新增 */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
            className="text-xs px-3 py-2 border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all font-[family-name:var(--font-mono)] whitespace-nowrap"
            title={sortOrder === "desc" ? "时间倒序（最新在前）" : "时间正序（最早在前）"}
          >
            {sortOrder === "desc" ? "↓ 最新" : "↑ 最早"}
          </button>
          {authed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
                disabled={saving}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-transparent border-2 border-cyber-green text-cyber-green text-sm font-[family-name:var(--font-mono)] rounded hover:bg-cyber-green/10 transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="text-base leading-none">+</span>
                新增技能
              </button>
            </motion.div>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-[family-name:var(--font-mono)]">
            LOADING...
          </div>
        ) : skills.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cyber-card py-20 text-center"
          >
            <p className="text-gray-500 text-lg mb-2">暂无技能</p>
            <p className="text-gray-600 text-sm font-[family-name:var(--font-mono)]">
              {authed ? "点击上方「新增技能」添加第一个技能" : "管理员登录后可在此管理技能"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedSkills.map((s, i) => (
                <SkillCard
                  key={s.id}
                  skill={s}
                  index={i}
                  canEdit={authed}
                  onEdit={(sk) => {
                    setEditing(sk);
                    setModalOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Saving indicator */}
        {saving && (
          <div className="fixed bottom-6 right-6 z-50 cyber-card px-4 py-2 text-sm text-cyber-blue font-[family-name:var(--font-mono)]">
            保存中...
          </div>
        )}

        {/* Modal */}
        <SkillModal
          open={modalOpen}
          skill={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={editing ? handleEdit : handleAdd}
        />
      </div>
    </div>
  );
}
