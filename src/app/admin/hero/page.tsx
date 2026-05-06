"use client";

import { useState, useEffect } from "react";
import { useContent } from "@/lib/ContentContext";
import AdminPanel, {
  Field,
  inputClass,
  textareaClass,
  btnPrimary,
  btnGhost,
} from "@/components/admin/AdminPanel";
import ImageUploader from "@/components/admin/ImageUploader";

export default function HeroAdminPage() {
  const { content, updateSection, ready } = useContent();
  const [draft, setDraft] = useState(content.hero);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) setDraft(content.hero);
  }, [ready, content.hero]);

  const onSave = () => {
    updateSection("hero", draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <AdminPanel
      title="HERO 主屏"
      description="管理首页顶部展示：主标题、简介、头像"
      action={
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-cyber-green font-[family-name:var(--font-mono)]">
              ✓ 已保存
            </span>
          )}
          <button
            onClick={() => setDraft(content.hero)}
            className={btnGhost}
          >
            撤销
          </button>
          <button onClick={onSave} className={btnPrimary}>
            保存
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="主标题">
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className={inputClass}
            placeholder="例：鲁力铭"
          />
        </Field>

        <Field label="头像占位文字" hint="未设置头像 URL 时显示的字符">
          <input
            value={draft.avatarText}
            onChange={(e) =>
              setDraft({ ...draft, avatarText: e.target.value.slice(0, 2) })
            }
            className={inputClass}
            placeholder="鲁"
            maxLength={2}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="副标题 / 简介">
            <textarea
              value={draft.subtitle}
              onChange={(e) =>
                setDraft({ ...draft, subtitle: e.target.value })
              }
              className={textareaClass}
              rows={3}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field
            label="头像图片"
            hint="可粘贴 URL，也可点击上传本地图片（自动压缩并保存到浏览器）"
          >
            <ImageUploader
              value={draft.avatarUrl}
              onChange={(v) => setDraft({ ...draft, avatarUrl: v })}
              shape="circle"
              maxDimension={512}
              maxSizeMB={0.8}
              placeholder="https://... 或点击上传本地图片"
            />
          </Field>
        </div>

        {/* 预览 */}
        <div className="md:col-span-2">
          <div className="text-[11px] text-cyber-blue mb-2 font-[family-name:var(--font-mono)] tracking-widest">
            [PREVIEW]
          </div>
          <div className="cyber-card p-6 flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cyber-blue shadow-[0_0_20px_var(--color-cyber-blue)] shrink-0">
              {draft.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyber-dark via-cyber-black to-cyber-dark flex items-center justify-center">
                  <span className="font-[family-name:var(--font-orbitron)] text-2xl text-cyber-blue neon-text">
                    {draft.avatarText || "?"}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-[family-name:var(--font-orbitron)] text-2xl text-cyber-blue truncate">
                {draft.title || "(未设置标题)"}
              </div>
              <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                {draft.subtitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPanel>
  );
}
