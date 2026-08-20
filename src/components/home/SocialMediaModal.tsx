"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import type { SocialPlatform } from "@/lib/types";

const EMPTY_PLATFORM: Omit<SocialPlatform, "id"> = {
  name: "",
  icon: "📱",
  desc: "",
  qr: "",
  color: "#00f0ff",
};

export default function SocialMediaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { content, updateSection, saveStatus, flush } = useContent();
  const platforms = content.socialMedia ?? [];

  const [editing, setEditing] = useState<SocialPlatform | null>(null);
  const [form, setForm] = useState<Omit<SocialPlatform, "id">>(EMPTY_PLATFORM);
  const [saving, setSaving] = useState(false);

  // 检查是否管理员（有保存权限即可判断）
  const isAdmin =
    saveStatus !== "unauthorized" && typeof window !== "undefined";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 打开新增
  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_PLATFORM);
  };

  // 打开编辑
  const openEdit = (p: SocialPlatform) => {
    setEditing(p);
    setForm({ name: p.name, icon: p.icon, desc: p.desc, qr: p.qr, color: p.color });
  };

  // 保存（新增或编辑）
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    let next: SocialPlatform[];
    if (editing) {
      next = platforms.map((p) =>
        p.id === editing.id ? { ...editing, ...form } : p
      );
    } else {
      next = [
        ...platforms,
        { id: `sm${Date.now()}`, ...form },
      ];
    }

    updateSection("socialMedia", next);
    await flush();
    setSaving(false);
    setEditing(null);
    setForm(EMPTY_PLATFORM);
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该平台？")) return;
    const next = platforms.filter((p) => p.id !== id);
    updateSection("socialMedia", next);
    await flush();
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_PLATFORM);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-cyber-black/85 backdrop-blur-md" />

          {/* Modal 内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-cyber-dark border border-cyber-border rounded-lg p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.15)] max-h-[90vh] overflow-y-auto"
          >
            {/* 标题 + 工具栏 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-orbitron)] text-xl sm:text-2xl text-cyber-blue">
                📱 我的自媒体
              </h2>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <>
                    {!editing && (
                      <button
                        type="button"
                        onClick={openNew}
                        disabled={saving}
                        className="text-xs px-3 py-1.5 border border-cyber-green text-cyber-green hover:bg-cyber-green/10 transition-all font-[family-name:var(--font-mono)] disabled:opacity-50"
                      >
                        + 新增平台
                      </button>
                    )}
                    {saveStatus === "saved" && (
                      <span className="text-[11px] text-cyber-green font-[family-name:var(--font-mono)]">
                        ✓ 已保存
                      </span>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 编辑表单 */}
            {editing !== null || form.name ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-lg border border-cyber-blue/30 bg-cyber-black/40"
              >
                <p className="text-xs text-cyber-blue mb-3 font-[family-name:var(--font-mono)]">
                  {editing ? `编辑：${editing.name}` : "新增平台"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="平台名称（如：微信公众号）"
                    className="bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                  />
                  <input
                    value={form.icon}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, icon: e.target.value }))
                    }
                    placeholder="图标 emoji（如：💬）"
                    className="bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                  />
                  <input
                    value={form.desc}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, desc: e.target.value }))
                    }
                    placeholder="描述文字"
                    className="bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                  />
                  <input
                    value={form.qr}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, qr: e.target.value }))
                    }
                    placeholder="二维码路径（如：/images/qrcode-wechat.png）"
                    className="bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                  />
                  <input
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    placeholder="品牌色（如：#07c160）"
                    className="bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !form.name.trim()}
                      className="flex-1 px-4 py-2 bg-cyber-green/20 border border-cyber-green text-cyber-green text-sm hover:bg-cyber-green/30 transition-all disabled:opacity-50 font-[family-name:var(--font-mono)]"
                    >
                      {saving ? "保存中..." : "保存"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-600 text-gray-400 text-sm hover:bg-white/5 transition-all font-[family-name:var(--font-mono)]"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {/* 平台卡片网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {platforms.map((p) => (
                <div
                  key={p.id}
                  className="relative flex flex-col items-center gap-3 p-4 rounded-lg border border-cyber-border/50 hover:border-opacity-100 transition-all group"
                  style={{ borderColor: `${p.color}40` }}
                >
                  {/* 管理员操作按钮 */}
                  {isAdmin && (
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="w-6 h-6 flex items-center justify-center bg-cyber-blue/80 text-white text-xs rounded hover:bg-cyber-blue transition-colors"
                        title="编辑"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="w-6 h-6 flex items-center justify-center bg-red-500/80 text-white text-xs rounded hover:bg-red-500 transition-colors"
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  )}

                  {/* 图标 + 名称 */}
                  <span className="text-3xl">{p.icon}</span>
                  <h3
                    className="font-[family-name:var(--font-mono)] text-sm font-bold"
                    style={{ color: p.color }}
                  >
                    {p.name}
                  </h3>

                  {/* 二维码 */}
                  <div className="relative w-28 h-28 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.qr}
                      alt={`${p.name} 二维码`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const placeholder = document.createElement("div");
                        placeholder.className =
                          "text-xs text-gray-400 text-center p-2 font-[family-name:var(--font-mono)]";
                        placeholder.textContent = "二维码待上传";
                        target.parentElement?.appendChild(placeholder);
                      }}
                    />
                  </div>

                  {/* 描述 */}
                  <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* 底部提示 */}
            <p className="mt-6 text-center text-xs text-gray-600 font-[family-name:var(--font-mono)]">
              扫码关注 · 更多精彩内容持续更新中
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
