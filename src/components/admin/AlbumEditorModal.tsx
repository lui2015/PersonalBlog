"use client";

import { useEffect, useState } from "react";
import type { GalleryAlbum, GalleryPhoto } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import EditorModal from "./EditorModal";
import { btnGhost, btnPrimary, inputClass, labelClass } from "./AdminPanel";

interface Props {
  open: boolean;
  initial: GalleryAlbum | null; // null = 新增
  onClose: () => void;
  onSave: (album: GalleryAlbum) => void;
}

function newPhoto(): GalleryPhoto {
  return { id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, src: "", title: "" };
}

export default function AlbumEditorModal({ open, initial, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<GalleryAlbum | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(
      initial ?? {
        id: `a-${Date.now().toString(36)}`,
        name: "",
        cover: "",
        count: 0,
        photos: [],
      }
    );
  }, [open, initial]);

  if (!draft) return null;

  const set = <K extends keyof GalleryAlbum>(key: K, value: GalleryAlbum[K]) =>
    setDraft({ ...draft, [key]: value });

  const updatePhoto = (id: string, patch: Partial<GalleryPhoto>) =>
    setDraft({
      ...draft,
      photos: draft.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });

  const addPhoto = () => setDraft({ ...draft, photos: [...draft.photos, newPhoto()] });

  const removePhoto = (id: string) =>
    setDraft({ ...draft, photos: draft.photos.filter((p) => p.id !== id) });

  const handleSave = () => {
    if (!draft.name.trim()) {
      alert("请填写相册名称");
      return;
    }
    onSave({ ...draft, name: draft.name.trim(), count: draft.photos.length });
  };

  return (
    <EditorModal
      open={open}
      title={initial ? "编辑相册" : "新增相册"}
      onClose={onClose}
      maxWidth="max-w-3xl"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>相册名称 *</label>
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="例如：旅行碎片"
            />
          </div>
          <div>
            <label className={labelClass}>封面图</label>
            <ImageUploader
              value={draft.cover}
              onChange={(v) => set("cover", v)}
              shape="rect"
              previewHeight={120}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={labelClass + " mb-0"}>照片（{draft.photos.length}）</span>
          <button className={btnGhost} onClick={addPhoto}>
            + 添加照片
          </button>
        </div>

        <div className="space-y-3">
          {draft.photos.length === 0 && (
            <p className="text-center text-sm text-gray-500">暂无照片，点击上方按钮添加。</p>
          )}
          {draft.photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="flex gap-3 rounded border border-cyber-border bg-cyber-black/40 p-3"
            >
              <div className="w-28 shrink-0">
                <ImageUploader
                  value={photo.src}
                  onChange={(v) => updatePhoto(photo.id, { src: v })}
                  shape="rect"
                  previewHeight={96}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <input
                  className={inputClass}
                  value={photo.title}
                  onChange={(e) => updatePhoto(photo.id, { title: e.target.value })}
                  placeholder={`照片标题 ${idx + 1}`}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>#{idx + 1}</span>
                  <button
                    className="text-cyber-pink hover:underline"
                    onClick={() => removePhoto(photo.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditorModal>
  );
}
