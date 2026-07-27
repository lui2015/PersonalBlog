"use client";

import { useEffect, useState } from "react";
import type { Work } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import EditorModal from "./EditorModal";
import {
  btnGhost,
  btnPrimary,
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from "./AdminPanel";

const CATEGORIES = ["技术", "创意", "生活", "随笔", "教程", "评测", "其他"];

function slugify(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9一-龥]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || `post-${Date.now().toString(36)}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  open: boolean;
  initial: Work | null; // null = 新增
  onClose: () => void;
  onSave: (work: Work) => void;
}

export default function WorkEditorModal({ open, initial, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Work | null>(null);
  const [tagsText, setTagsText] = useState("");
  const [customCat, setCustomCat] = useState("");

  useEffect(() => {
    if (!open) return;
    const base: Work = initial ?? {
      id: `w-${Date.now().toString(36)}`,
      slug: "",
      title: "",
      excerpt: "",
      date: today(),
      category: "技术",
      tags: [],
      readTime: "5 min",
      cover: "",
      content: "",
    };
    setDraft(base);
    setTagsText((base.tags ?? []).join(", "));
    setCustomCat(
      base.category && !CATEGORIES.includes(base.category) ? base.category : ""
    );
  }, [open, initial]);

  if (!draft) return null;

  const set = <K extends keyof Work>(key: K, value: Work[K]) =>
    setDraft({ ...draft, [key]: value });

  const handleSave = () => {
    if (!draft.title.trim()) {
      alert("请填写标题");
      return;
    }
    const category =
      draft.category === "自定义" ? customCat.trim() || "其他" : draft.category;
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const slug = draft.slug.trim() || slugify(draft.title);
    onSave({
      ...draft,
      title: draft.title.trim(),
      category,
      slug,
      tags,
    });
  };

  const isCustom = draft.category === "自定义";

  return (
    <EditorModal
      open={open}
      title={initial ? "编辑文章" : "新增文章"}
      onClose={onClose}
      footer={
        <>
          <button className={btnGhost} onClick={onClose}>
            取消
          </button>
          <button className={btnPrimary} onClick={handleSave}>
            保存
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelClass}>标题 *</label>
          <input
            className={inputClass}
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="文章标题"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>分类</label>
            <select
              className={selectClass}
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="自定义">自定义…</option>
            </select>
          </div>
          {isCustom && (
            <div>
              <label className={labelClass}>自定义分类</label>
              <input
                className={inputClass}
                value={customCat}
                onChange={(e) => setCustomCat(e.target.value)}
                placeholder="输入分类名"
              />
            </div>
          )}
          <div>
            <label className={labelClass}>日期</label>
            <input
              type="date"
              className={inputClass}
              value={draft.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>阅读时长</label>
            <input
              className={inputClass}
              value={draft.readTime}
              onChange={(e) => set("readTime", e.target.value)}
              placeholder="5 min"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Slug（URL 标识，留空自动生成）</label>
          <input
            className={inputClass}
            value={draft.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="自动生成"
          />
        </div>

        <div>
          <label className={labelClass}>标签（逗号分隔）</label>
          <input
            className={inputClass}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="技术, 思考"
          />
        </div>

        <div>
          <label className={labelClass}>封面图</label>
          <ImageUploader
            value={draft.cover}
            onChange={(v) => set("cover", v)}
            shape="rect"
            previewHeight={140}
          />
        </div>

        <div>
          <label className={labelClass}>摘要</label>
          <textarea
            className={textareaClass}
            rows={2}
            value={draft.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="一句话简介"
          />
        </div>

        <div>
          <label className={labelClass}>正文（Markdown）</label>
          <textarea
            className={textareaClass}
            style={{ minHeight: 220 }}
            value={draft.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="支持 Markdown 语法…"
          />
        </div>
      </div>
    </EditorModal>
  );
}
