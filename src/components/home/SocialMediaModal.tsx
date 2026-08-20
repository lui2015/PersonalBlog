"use client";

import { useEffect, useRef, useState } from "react";
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
  const [showForm, setShowForm] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  // 隐藏的文件 input refs
  const iconInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  // 检查是否管理员
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
    setShowForm(true);
  };

  // 打开编辑
  const openEdit = (p: SocialPlatform) => {
    setEditing(p);
    setForm({ name: p.name, icon: p.icon, desc: p.desc, qr: p.qr, color: p.color });
    setShowForm(true);
  };

  // 上传图片到服务器
  const uploadFile = async (
    file: File,
    type: "icon" | "qr"
  ): Promise<string | null> => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) return data.url;
      alert(`上传失败：${data.error || "未知错误"}`);
      return null;
    } catch (err) {
      alert(`上传出错：${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  };

  // 处理图标上传（图片 → URL 填入 icon 字段）
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    const url = await uploadFile(file, "icon");
    if (url) setForm((f) => ({ ...f, icon: url }));
    setUploadingIcon(false);
    // 重置 input 以便重复选择同一文件
    if (iconInputRef.current) iconInputRef.current.value = "";
  };

  // 处理二维码上传
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQr(true);
    const url = await uploadFile(file, "qr");
    if (url) setForm((f) => ({ ...f, qr: url }));
    setUploadingQr(false);
    if (qrInputRef.current) qrInputRef.current.value = "";
  };

  // 判断 icon 是否为图片 URL（非 emoji）
  const isImageUrl = (val: string): boolean =>
    val.startsWith("/") || val.startsWith("http");

  // 保存
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
    setShowForm(false);
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
    setShowForm(false);
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
                    {!showForm && (
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
            {showForm ? (
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
                  {/* 平台名称 */}
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="平台名称（如：微信公众号）"
                    className="bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                  />
                  {/* 描述文字 */}
                  <input
                    value={form.desc}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, desc: e.target.value }))
                    }
                    placeholder="描述文字"
                    className="bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                  />

                  {/* 图标：emoji 输入 + 图片上传 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1 font-[family-name:var(--font-mono)]">
                      图标（emoji 或上传图片）
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        value={form.icon}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, icon: e.target.value }))
                        }
                        placeholder="输入 emoji（如 💬）或下方上传图片"
                        className="flex-1 bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        disabled={uploadingIcon}
                        className="shrink-0 px-3 py-2 text-xs border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all font-[family-name:var(--font-mono)] disabled:opacity-50"
                      >
                        {uploadingIcon ? "上传中..." : "📷 上传"}
                      </button>
                      {/* 图标预览 */}
                      {isImageUrl(form.icon) && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={form.icon}
                          alt="icon preview"
                          className="w-8 h-8 object-contain rounded"
                        />
                      )}
                      {!isImageUrl(form.icon) && form.icon && (
                        <span className="text-xl">{form.icon}</span>
                      )}
                    </div>
                    <input
                      ref={iconInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                  </div>

                  {/* 二维码：上传 + 路径显示 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1 font-[family-name:var(--font-mono)]">
                      二维码图片
                    </label>
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => qrInputRef.current?.click()}
                        disabled={uploadingQr}
                        className="shrink-0 px-4 py-3 border-2 border-dashed border-cyber-border hover:border-cyber-blue text-gray-400 hover:text-cyber-blue text-xs transition-all font-[family-name:var(--font-mono)] disabled:opacity-50 min-w-[100px]"
                      >
                        {uploadingQr ? "上传中..." : form.qr ? "重新上传" : "点击上传二维码"}
                      </button>
                      <input
                        ref={qrInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                      {/* 二维码预览 */}
                      {form.qr && (
                        <div className="w-20 h-20 bg-white rounded overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={form.qr}
                            alt="QR preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      {!form.qr && (
                        <span className="text-xs text-gray-600 pt-2 font-[family-name:var(--font-mono)]">
                          未上传二维码
                        </span>
                      )}
                    </div>
                    {form.qr && (
                      <p className="mt-1 text-[11px] text-gray-600 truncate font-[family-name:var(--font-mono)]">
                        路径：{form.qr}
                      </p>
                    )}
                  </div>

                  {/* 品牌色 */}
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, color: e.target.value }))
                      }
                      className="w-8 h-8 cursor-pointer rounded border border-cyber-border bg-transparent"
                    />
                    <input
                      value={form.color}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, color: e.target.value }))
                      }
                      placeholder="品牌色（如 #07c160）"
                      className="flex-1 bg-cyber-black/60 border border-cyber-border focus:border-cyber-blue outline-none px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 transition-colors font-[family-name:var(--font-mono)]"
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="sm:col-span-2 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-600 text-gray-400 text-sm hover:bg-white/5 transition-all font-[family-name:var(--font-mono)]"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || !form.name.trim()}
                      className="px-4 py-2 bg-cyber-green/20 border border-cyber-green text-cyber-green text-sm hover:bg-cyber-green/30 transition-all disabled:opacity-50 font-[family-name:var(--font-mono)]"
                    >
                      {saving ? "保存中..." : "保存"}
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

                  {/* 图标 */}
                  {isImageUrl(p.icon) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.icon}
                      alt={`${p.name} 图标`}
                      className="w-10 h-10 object-contain rounded"
                    />
                  ) : (
                    <span className="text-3xl">{p.icon}</span>
                  )}

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
