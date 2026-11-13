"use client";

import { useEffect, useRef, useState } from "react";
import type { Work } from "@/lib/types";
import { markdownToHtml } from "@/lib/markdown";
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

interface FormatTool {
  label: string;
  title: string;
  before: string;
  after?: string;
  placeholder: string;
}

const FORMAT_TOOLS: FormatTool[] = [
  { label: "H2", title: "二级标题", before: "## ", placeholder: "小标题" },
  { label: "H3", title: "三级标题", before: "### ", placeholder: "小标题" },
  { label: "B", title: "加粗", before: "**", after: "**", placeholder: "加粗文字" },
  { label: "I", title: "斜体", before: "*", after: "*", placeholder: "斜体文字" },
  { label: "🔗", title: "链接", before: "[", after: "](https://)", placeholder: "链接文字" },
  { label: "🖼", title: "图片", before: "![", after: "](/uploads/image.jpg)", placeholder: "图片说明" },
  { label: "❝", title: "引用", before: "> ", placeholder: "引用内容" },
  { label: "•", title: "无序列表", before: "- ", placeholder: "列表项" },
  { label: "1.", title: "有序列表", before: "1. ", placeholder: "列表项" },
  { label: "</>", title: "代码块", before: "```\n", after: "\n```", placeholder: "代码" },
  { label: "—", title: "分隔线", before: "\n---\n", placeholder: "" },
];

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
  const [preview, setPreview] = useState(false);
  const [copied, setCopied] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setPreview(false);
    setCopied("");
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

  const applyFormat = (tool: FormatTool) => {
    const el = contentRef.current;
    const value = draft.content ?? "";
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || tool.placeholder;
    const next =
      value.slice(0, start) +
      tool.before +
      selected +
      (tool.after ?? "") +
      value.slice(end);
    set("content", next);
    setPreview(false);
    requestAnimationFrame(() => {
      el?.focus();
      const caret = start + tool.before.length;
      el?.setSelectionRange(caret, caret + selected.length);
    });
  };

  const copyText = async (text: string, kind: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      alert("复制失败，请手动选中文本复制");
    }
  };

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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className={labelClass}>正文（Markdown）</label>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                className={btnGhost}
                onClick={() => setPreview((v) => !v)}
              >
                {preview ? "✏️ 编辑" : "👁 预览"}
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => copyText(draft.content, "md")}
              >
                {copied === "md" ? "✓ 已复制" : "复制 Markdown"}
              </button>
              <button
                type="button"
                className={btnGhost}
                onClick={() => copyText(markdownToHtml(draft.content), "html")}
              >
                {copied === "html" ? "✓ 已复制" : "复制 HTML"}
              </button>
            </div>
          </div>

          {!preview && (
            <div className="flex flex-wrap gap-1 mb-2">
              {FORMAT_TOOLS.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  title={tool.title}
                  onClick={() => applyFormat(tool)}
                  className="min-w-[32px] px-2 py-1 text-xs rounded border border-cyber-border/60 text-gray-300 hover:text-cyber-blue hover:border-cyber-blue/70 transition-colors"
                >
                  {tool.label}
                </button>
              ))}
            </div>
          )}

          {preview ? (
            <div
              className={`${textareaClass} article-body overflow-auto`}
              style={{ minHeight: 220 }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(draft.content) }}
            />
          ) : (
            <textarea
              ref={contentRef}
              className={textareaClass}
              style={{ minHeight: 220 }}
              value={draft.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="支持 Markdown 语法…"
            />
          )}
          <p className="text-[11px] text-gray-600 mt-1">
            支持标题、加粗、斜体、链接、图片、列表、引用、代码块、分隔线；预览与开放接口返回的 contentHtml 使用同一套渲染规则
          </p>
        </div>
      </div>
    </EditorModal>
  );
}
