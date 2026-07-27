"use client";

import { useEffect, useState } from "react";
import type { Video } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import EditorModal from "./EditorModal";
import {
  btnGhost,
  btnPrimary,
  inputClass,
  labelClass,
} from "./AdminPanel";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  open: boolean;
  initial: Video | null; // null = 新增
  onClose: () => void;
  onSave: (video: Video) => void;
}

export default function VideoEditorModal({ open, initial, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Video | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(
      initial ?? {
        id: `v-${Date.now().toString(36)}`,
        title: "",
        category: "技术",
        duration: "00:00",
        cover: "",
        views: "0",
        date: today(),
        src: "",
      }
    );
  }, [open, initial]);

  if (!draft) return null;

  const set = <K extends keyof Video>(key: K, value: Video[K]) =>
    setDraft({ ...draft, [key]: value });

  const handleSave = () => {
    if (!draft.title.trim()) {
      alert("请填写标题");
      return;
    }
    onSave({ ...draft, title: draft.title.trim() });
  };

  return (
    <EditorModal
      open={open}
      title={initial ? "编辑视频" : "新增视频"}
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
            placeholder="视频标题"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>分类</label>
            <input
              className={inputClass}
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="技术"
            />
          </div>
          <div>
            <label className={labelClass}>时长</label>
            <input
              className={inputClass}
              value={draft.duration}
              onChange={(e) => set("duration", e.target.value)}
              placeholder="08:24"
            />
          </div>
          <div>
            <label className={labelClass}>播放量</label>
            <input
              className={inputClass}
              value={draft.views}
              onChange={(e) => set("views", e.target.value)}
              placeholder="1.2万"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>发布日期</label>
            <input
              type="date"
              className={inputClass}
              value={draft.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Bilibili 嵌入地址</label>
            <input
              className={inputClass}
              value={draft.src}
              onChange={(e) => set("src", e.target.value)}
              placeholder="https://player.bilibili.com/player.html?bvid=BV..."
            />
          </div>
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
      </div>
    </EditorModal>
  );
}
