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
      // 1) 浏览器侧压缩，减少带宽
      const compressed = await compressImage(file, maxDimension, maxSizeMB);
      // 2) 上传到服务端
      const form = new FormData();
      form.append("file", compressed, compressed.name);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      if (!res.ok) {
        if (res.status === 401) {
          setErr("未登录或登录已过期");
          return;
        }
        let msg = `上传失败：HTTP ${res.status}`;
        try {
          const j = (await res.json()) as { error?: string };
          if (j?.error) msg = `上传失败：${j.error}`;
        } catch {
          /* ignore */
        }
        setErr(msg);
        return;
      }
      const data = (await res.json()) as { ok: boolean; url?: string };
      if (data.ok && data.url) {
        onChange(data.url);
      } else {
        setErr("上传失败：服务端未返回 URL");
      }
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
          {busy ? "上传中..." : "上传本地图片"}
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
 * 浏览器侧压缩：超尺寸缩放 + jpeg 质量循环。
 * 返回一个 File，便于 FormData 上传时保留文件名/类型。
 */
function compressImage(
  file: File,
  maxDimension: number,
  maxSizeMB: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    // 不可压缩的格式（svg/gif）直接原样上传
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = async () => {
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

          const target = maxSizeMB * 1024 * 1024;
          const isPng = file.type === "image/png";

          if (isPng) {
            const blob = await canvasToBlob(canvas, "image/png");
            if (blob && blob.size <= target) {
              return resolve(toFile(blob, file.name, ".png"));
            }
            // PNG 太大，回退到 jpeg
          }

          let q = 0.92;
          let blob = await canvasToBlob(canvas, "image/jpeg", q);
          while (blob && blob.size > target && q > 0.4) {
            q -= 0.1;
            blob = await canvasToBlob(canvas, "image/jpeg", q);
          }
          if (!blob) return reject(new Error("encode failed"));
          resolve(toFile(blob, file.name, ".jpg"));
        } catch (e) {
          reject(e);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function toFile(blob: Blob, originalName: string, ext: string): File {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}${ext}`, { type: blob.type });
}
