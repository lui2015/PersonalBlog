"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_CONTENT } from "./defaultContent";
import type { SiteContent } from "./types";

const STORAGE_KEY = "siteContent_v1";
const SAVE_DEBOUNCE_MS = 600;

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "unauthorized";

interface ContentContextValue {
  content: SiteContent;
  /** 已尝试从服务端加载过（无论成功失败） */
  ready: boolean;
  /** 服务端加载是否成功（false 表示当前用的是本地兜底） */
  syncedFromServer: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  setContent: (next: SiteContent) => void;
  updateSection: <K extends keyof SiteContent>(
    key: K,
    value: SiteContent[K]
  ) => void;
  /** 立即把当前 content 推到服务端（不等防抖） */
  flush: () => Promise<void>;
  /** 重置为示例数据（仍会推到服务端） */
  reset: () => void;
  /** 用一份 JSON 替换全部（导入时用） */
  importContent: (raw: unknown) => boolean;
}

const ContentContext = createContext<ContentContextValue | null>(null);

function loadFromLocal(): SiteContent {
  if (typeof window === "undefined") return DEFAULT_CONTENT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return mergeWithDefault(parsed);
  } catch {
    return DEFAULT_CONTENT;
  }
}

function mergeWithDefault(p: Partial<SiteContent>): SiteContent {
  return {
    hero: { ...DEFAULT_CONTENT.hero, ...(p.hero ?? {}) },
    poems: p.poems ?? DEFAULT_CONTENT.poems,
    photos: p.photos ?? DEFAULT_CONTENT.photos,
    stats: p.stats ?? DEFAULT_CONTENT.stats,
    skills: p.skills ?? DEFAULT_CONTENT.skills,
    myskills: p.myskills ?? DEFAULT_CONTENT.myskills,
    quotes: p.quotes ?? DEFAULT_CONTENT.quotes,
    works: p.works ?? DEFAULT_CONTENT.works,
    videos: p.videos ?? DEFAULT_CONTENT.videos,
    albums: p.albums ?? DEFAULT_CONTENT.albums,
  };
}

function isSiteContentShape(v: unknown): v is SiteContent {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.hero === "object" &&
    Array.isArray(o.poems) &&
    Array.isArray(o.photos) &&
    Array.isArray(o.stats) &&
    Array.isArray(o.skills) &&
    Array.isArray(o.quotes) &&
    Array.isArray(o.works)
  );
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(DEFAULT_CONTENT);
  const [ready, setReady] = useState(false);
  const [syncedFromServer, setSyncedFromServer] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // 是否已完成首次加载（首次加载阶段不要触发保存）
  const initializedRef = useRef(false);
  // 防抖 timer
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 最新内容引用（flush 用）
  const latestRef = useRef<SiteContent>(DEFAULT_CONTENT);

  // 1) 客户端首屏：先用本地兜底秒显示，避免白屏
  useEffect(() => {
    setContentState(loadFromLocal());
  }, []);

  // 2) 然后异步去服务端拉真实数据覆盖
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as SiteContent;
          if (!aborted && isSiteContentShape(data)) {
            setContentState(data);
            setSyncedFromServer(true);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            } catch {
              /* ignore */
            }
          }
        }
      } catch {
        // 网络失败，沉默使用本地兜底
      } finally {
        if (!aborted) {
          setReady(true);
          // 加载阶段结束之后再允许保存
          // 用 microtask 让 setContentState 先生效
          queueMicrotask(() => {
            initializedRef.current = true;
          });
        }
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // 3) content 变化：写本地缓存 + 防抖推服务端
  useEffect(() => {
    latestRef.current = content;
    if (!initializedRef.current) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      /* quota ignore */
    }

    setSaveStatus("saving");
    setSaveError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void pushToServer(content)
        .then((r) => {
          if (r === "ok") setSaveStatus("saved");
          else if (r === "unauthorized") setSaveStatus("unauthorized");
          else {
            setSaveStatus("error");
            setSaveError(r);
          }
        })
        .catch((e: unknown) => {
          setSaveStatus("error");
          setSaveError(e instanceof Error ? e.message : String(e));
        });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content]);

  // 4) 跨标签同步（同一台机器多开后台）
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (isSiteContentShape(parsed)) {
            // 直接 set，但不要触发 push（initializedRef 仍 true，会再 push 一次，
            // 不过服务端是幂等的，问题不大；要严谨可加 silent flag）
            setContentState(parsed);
          }
        } catch {
          /* noop */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setContent = useCallback((next: SiteContent) => {
    setContentState(next);
  }, []);

  const updateSection = useCallback(
    <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
      setContentState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const flush = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setSaveStatus("saving");
    const r = await pushToServer(latestRef.current);
    if (r === "ok") setSaveStatus("saved");
    else if (r === "unauthorized") setSaveStatus("unauthorized");
    else {
      setSaveStatus("error");
      setSaveError(r);
    }
  }, []);

  const reset = useCallback(() => {
    setContentState(DEFAULT_CONTENT);
  }, []);

  const importContent = useCallback((raw: unknown): boolean => {
    if (!isSiteContentShape(raw)) return false;
    setContentState(mergeWithDefault(raw as Partial<SiteContent>));
    return true;
  }, []);

  const value = useMemo<ContentContextValue>(
    () => ({
      content,
      ready,
      syncedFromServer,
      saveStatus,
      saveError,
      setContent,
      updateSection,
      flush,
      reset,
      importContent,
    }),
    [
      content,
      ready,
      syncedFromServer,
      saveStatus,
      saveError,
      setContent,
      updateSection,
      flush,
      reset,
      importContent,
    ]
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}

async function pushToServer(
  content: SiteContent
): Promise<"ok" | "unauthorized" | string> {
  try {
    const res = await fetch("/api/content", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    if (res.ok) return "ok";
    if (res.status === 401) return "unauthorized";
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    return msg;
  } catch (e: unknown) {
    return e instanceof Error ? e.message : "network error";
  }
}
