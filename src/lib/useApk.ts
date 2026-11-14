"use client";

import { useCallback, useEffect, useState } from "react";

export interface ApkMeta {
  exists: boolean;
  url: string;
  /** 字节数；仅上传过的新包才有 */
  size?: number;
  /** 上传时间 ms */
  updatedAt?: number;
}

/** 字节数 → 展示文本，如 "6.1 MB" */
export function formatApkSize(size?: number): string {
  if (!size || size <= 0) return "";
  const mb = size / (1024 * 1024);
  return `${mb >= 100 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

/** APK 下载信息 + 管理员上传替换 */
export function useApk() {
  const [meta, setMeta] = useState<ApkMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/apk", { cache: "no-store" });
      if (res.ok) {
        setMeta((await res.json()) as ApkMeta);
      }
    } catch {
      /* 保持 null，前端回退默认值 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** 上传新 APK 替换旧包 */
  const upload = useCallback(
    async (file: File): Promise<{ ok: boolean; error?: string }> => {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/apk", {
          method: "POST",
          body: fd,
          credentials: "same-origin",
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          return { ok: false, error: data.error || `HTTP ${res.status}` };
        }
        await refresh();
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
    [refresh]
  );

  return { meta, loading, refresh, upload };
}
