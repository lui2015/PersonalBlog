"use client";

import { useEffect, useState } from "react";
import EditorModal from "./EditorModal";
import ImageUploader from "./ImageUploader";
import { inputClass, labelClass, textareaClass, btnPrimary, btnGhost, btnDanger } from "./AdminPanel";
import type { SoftwareWork } from "@/lib/types";

interface Props {
  open: boolean;
  initial: SoftwareWork | null; // null 表示新增
  onClose: () => void;
  onSave: (software: SoftwareWork) => void;
  onDelete?: (id: string) => void;
}

function emptySoftware(): SoftwareWork {
  return {
    id: `sw-${Date.now()}`,
    name: "",
    image: "",
    description: "",
    url: "",
  };
}

export default function SoftwareEditorModal({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<SoftwareWork>(emptySoftware());

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : emptySoftware());
    }
  }, [open, initial]);

  const set = <K extends keyof SoftwareWork>(key: K, val: SoftwareWork[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canSave = form.name.trim() && form.url.trim();

  return (
    <EditorModal
      open={open}
      title={initial ? "编辑软件作品" : "新增软件作品"}
      onClose={onClose}
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
          <label className={labelClass}>名称 *</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="例如：股票市场预测"
          />
        </div>

        <div>
          <label className={labelClass}>封面图片</label>
          <ImageUploader
            value={form.image}
            onChange={(v) => set("image", v)}
            previewHeight={180}
          />
        </div>

        <div>
          <label className={labelClass}>简介</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="一句话介绍这个软件作品"
          />
        </div>

        <div>
          <label className={labelClass}>跳转地址 *</label>
          <input
            className={inputClass}
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://... 点击卡片后打开的网页"
          />
          {!canSave && (
            <p className="text-xs text-red-400 mt-1">请填写名称与跳转地址</p>
          )}
        </div>
      </div>
    </EditorModal>
  );
}
