"use client";

import { useEffect, useState } from "react";
import EditorModal from "./EditorModal";
import {
  inputClass,
  labelClass,
  textareaClass,
  btnPrimary,
  btnGhost,
  btnDanger,
} from "./AdminPanel";
import type { Poem } from "@/lib/types";

interface Props {
  open: boolean;
  initial: Poem | null; // null 表示新增
  onClose: () => void;
  onSave: (poem: Poem) => void;
  onDelete?: (id: string) => void;
}

function emptyPoem(): Poem {
  return {
    id: `poem-${Date.now()}`,
    title: "",
    author: "",
    date: "",
    content: "",
  };
}

export default function PoemEditorModal({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<Poem>(emptyPoem());

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : emptyPoem());
    }
  }, [open, initial]);

  const set = <K extends keyof Poem>(key: K, val: Poem[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canSave = form.title.trim() && form.content.trim();

  return (
    <EditorModal
      open={open}
      title={initial ? "编辑诗词" : "新增诗词"}
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <>
          {initial && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(form.id)}
              className={btnDanger}
            >
              删除
            </button>
          )}
          <button type="button" onClick={onClose} className={btnGhost}>
            取消
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={!canSave}
            className={btnPrimary}
          >
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
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="例如：静夜思"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>作者</label>
            <input
              className={inputClass}
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="例如：李白"
            />
          </div>
          <div>
            <label className={labelClass}>创作时间</label>
            <input
              className={inputClass}
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>正文 *</label>
          <textarea
            className={textareaClass}
            rows={6}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            placeholder="每句一行，例如：&#10;床前明月光，&#10;疑是地上霜。"
          />
          {!canSave && (
            <p className="text-xs text-red-400 mt-1">请填写标题与正文</p>
          )}
        </div>
      </div>
    </EditorModal>
  );
}
