"use client";

import { useRef, useState } from "react";
import { btnGhost, inputClass } from "./AdminPanel";

interface Props {
  value: string;
  onChange: (val: string) => void;
  /** 圆形头像 / 矩形封面 */
  shape?: "circle" | "rect";
  /** 预览高度（rect 模式） */
  previewHeight?: number;
  /** 最大文件大小（MB），超出会压缩 */
  maxSizeMB?: number;
  /** 压缩后最长边（px） */
  maxDimension?: number;
  placeholder?: string;
}

export default function ImageUploader({
  value,
  onChange,
  shape = "rect",
  previewHeight = 192,
  maxSizeMB = 1.5,
  maxDimension = 1024,
  placeholder = "https://... 或点击右侧上传本地图片",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setErr(null);
    if (!file.type.startsWith("image/")) {
      setErr("请选择图片文件");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await readAndCompress(file, maxDimension, maxSizeMB);
      onChange(dataUrl);
    } catch (e) {
      console.error(e);
      setErr("图片处理失败");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const isImage = !!value;
  const isCircle = shape === "circle";

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={btnGhost + " whitespace-nowrap"}
          disabled={busy}
        >
          {busy ? "处理中..." : "上传本地图片"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className={btnGhost + " whitespace-nowrap"}
          >
            清除
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {err && (
        <div className="text-[11px] text-cyber-pink font-[family-name:var(--font-mono)]">
          ⚠ {err}
        </div>
      )}

      {isImage && (
        <div
          className={
            isCircle
              ? "relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyber-blue shadow-[0_0_15px_var(--color-cyber-blue)]"
              : "relative overflow-hidden rounded border border-cyber-border"
          }
          style={isCircle ? undefined : { height: previewHeight }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            onError={() => setErr("图片地址无法加载")}
          />
          {!isCircle && <div className="absolute inset-0 scanlines opacity-30" />}
        </div>
      )}
    </div>
  );
}

/**
 * 读取文件 → 自动压缩 → 返回 dataURL（base64）
 * 超出 maxDimension 会等比缩放，并按需要降低 jpeg 质量直至小于 maxSizeMB。
 */
function readAndCompress(
  file: File,
  maxDimension: number,
  maxSizeMB: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        try {
          const { width: w0, height: h0 } = img;
          const scale = Math.min(1, maxDimension / Math.max(w0, h0));
          const w = Math.round(w0 * scale);
          const h = Math.round(h0 * scale);

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("no canvas ctx"));
          ctx.drawImage(img, 0, 0, w, h);

          // PNG 透明优先 PNG，否则用 jpeg+质量循环
          const isPng = file.type === "image/png";
          const target = maxSizeMB * 1024 * 1024;

          if (isPng) {
            const out = canvas.toDataURL("image/png");
            // PNG 没法降质量，太大就回退转 jpeg
            if (estimateBytes(out) <= target) return resolve(out);
          }

          let q = 0.92;
          let out = canvas.toDataURL("image/jpeg", q);
          while (estimateBytes(out) > target && q > 0.4) {
            q -= 0.1;
            out = canvas.toDataURL("image/jpeg", q);
          }
          resolve(out);
        } catch (e) {
          reject(e);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

function estimateBytes(dataUrl: string) {
  // dataURL: "data:...;base64,XXXX"
  const i = dataUrl.indexOf(",");
  if (i < 0) return dataUrl.length;
  const b64 = dataUrl.slice(i + 1);
  return Math.floor((b64.length * 3) / 4);
}
