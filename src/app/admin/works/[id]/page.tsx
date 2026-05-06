"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminPanel, {
  Field,
  inputClass,
  textareaClass,
  btnPrimary,
  btnGhost,
  btnDanger,
} from "@/components/admin/AdminPanel";
import ImageUploader from "@/components/admin/ImageUploader";
import { useContent } from "@/lib/ContentContext";
import type { Work } from "@/lib/types";

const PRESET_CATEGORIES = ["软件", "视频", "摄影", "文章"];
const CUSTOM_FLAG = "__custom__";

export default function WorkEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { content, updateSection, ready } = useContent();

  const initial = useMemo(
    () => content.works.find((w) => w.id === id) ?? null,
    [content.works, id]
  );

  const [draft, setDraft] = useState<Work | null>(initial);
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") ?? "");
  const [saved, setSaved] = useState(false);
  const [categoryMode, setCategoryMode] = useState<string>(() => {
    if (!initial) return PRESET_CATEGORIES[0];
    return PRESET_CATEGORIES.includes(initial.category)
      ? initial.category
      : CUSTOM_FLAG;
  });

  useEffect(() => {
    if (ready && initial) {
      setDraft(initial);
      setTagsInput(initial.tags.join(", "));
      setCategoryMode(
        PRESET_CATEGORIES.includes(initial.category)
          ? initial.category
          : CUSTOM_FLAG
      );
    }
  }, [ready, initial]);

  if (!ready) {
    return (
      <AdminPanel title="EDITOR" description="加载中...">
        <div className="text-gray-500 text-sm font-[family-name:var(--font-mono)]">
          // 加载中...
        </div>
      </AdminPanel>
    );
  }

  if (!initial || !draft) {
    return (
      <AdminPanel title="EDITOR · 未找到作品">
        <div className="text-gray-500 text-sm">
          找不到 ID 为 <code className="text-cyber-pink">{id}</code> 的作品。
        </div>
        <div className="mt-4">
          <Link href="/admin/works" className={btnGhost}>
            ← 返回列表
          </Link>
        </div>
      </AdminPanel>
    );
  }

  const slugConflict = content.works.some(
    (w) => w.id !== draft.id && w.slug === draft.slug
  );

  const onSave = () => {
    if (!draft.title.trim()) {
      alert("标题不能为空");
      return;
    }
    if (!draft.slug.trim()) {
      alert("slug 不能为空");
      return;
    }
    if (slugConflict) {
      alert("slug 与其他作品冲突，请修改");
      return;
    }

    const next = {
      ...draft,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    updateSection(
      "works",
      content.works.map((w) => (w.id === next.id ? next : w))
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const onDelete = () => {
    if (!confirm("确认删除该作品？")) return;
    updateSection(
      "works",
      content.works.filter((w) => w.id !== draft.id)
    );
    router.replace("/admin/works");
  };

  return (
    <AdminPanel
      title={`EDITOR · ${draft.title || "未命名"}`}
      description={`编辑作品 · /blog/${draft.slug}`}
      action={
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-cyber-green font-[family-name:var(--font-mono)]">
              ✓ 已保存
            </span>
          )}
          <Link href={`/blog/${draft.slug}`} target="_blank" className={btnGhost}>
            预览
          </Link>
          <Link href="/admin/works" className={btnGhost}>
            返回
          </Link>
          <button onClick={onDelete} className={btnDanger}>
            删除
          </button>
          <button onClick={onSave} className={btnPrimary}>
            保存
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="标题">
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          hint={
            slugConflict
              ? "⚠ 与其他作品 slug 冲突"
              : "URL 路径片段，仅允许字母数字与中划线"
          }
        >
          <input
            value={draft.slug}
            onChange={(e) =>
              setDraft({
                ...draft,
                slug: e.target.value.replace(/\s+/g, "-"),
              })
            }
            className={`${inputClass} ${
              slugConflict ? "border-cyber-pink" : ""
            }`}
          />
        </Field>

        <Field label="分类">
          <div className="flex gap-2">
            <select
              value={categoryMode}
              onChange={(e) => {
                const v = e.target.value;
                setCategoryMode(v);
                if (v !== CUSTOM_FLAG) {
                  setDraft({ ...draft, category: v });
                } else {
                  // 切到自定义时，如果当前值还是预设值，清空便于输入
                  if (PRESET_CATEGORIES.includes(draft.category)) {
                    setDraft({ ...draft, category: "" });
                  }
                }
              }}
              className={inputClass + " max-w-[140px]"}
            >
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-cyber-black">
                  {c}
                </option>
              ))}
              <option value={CUSTOM_FLAG} className="bg-cyber-black">
                自定义
              </option>
            </select>
            {categoryMode === CUSTOM_FLAG && (
              <input
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
                className={inputClass}
                placeholder="输入自定义分类"
                autoFocus
              />
            )}
          </div>
        </Field>

        <Field label="日期">
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="阅读时长">
          <input
            value={draft.readTime}
            onChange={(e) => setDraft({ ...draft, readTime: e.target.value })}
            className={inputClass}
            placeholder="8 min"
          />
        </Field>

        <Field label="标签" hint="用英文逗号分隔，例如：CSS, 动画, 设计">
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="封面图片" hint="可粘贴 URL，也可上传本地图片（建议 800x400）">
            <ImageUploader
              value={draft.cover}
              onChange={(v) => setDraft({ ...draft, cover: v })}
              shape="rect"
              previewHeight={192}
              maxDimension={1280}
              maxSizeMB={1.2}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="摘要">
            <textarea
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              className={textareaClass}
              rows={3}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field
            label="正文 (Markdown)"
            hint="支持：## 二级标题、### 三级标题、段落、有序列表（1. / 2.）"
          >
            <textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              className={textareaClass}
              rows={18}
            />
          </Field>
        </div>
      </div>
    </AdminPanel>
  );
}
