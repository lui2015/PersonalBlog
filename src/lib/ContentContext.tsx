"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_CONTENT } from "./defaultContent";
import type { SiteContent } from "./types";

const STORAGE_KEY = "siteContent_v1";

interface ContentContextValue {
  content: SiteContent;
  ready: boolean;
  setContent: (next: SiteContent) => void;
  updateSection: <K extends keyof SiteContent>(
    key: K,
    value: SiteContent[K]
  ) => void;
  reset: () => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

function loadFromStorage(): SiteContent {
  if (typeof window === "undefined") return DEFAULT_CONTENT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    // 简单字段合并，缺失字段回退默认
    return {
      hero: { ...DEFAULT_CONTENT.hero, ...(parsed.hero ?? {}) },
      poems: parsed.poems ?? DEFAULT_CONTENT.poems,
      photos: parsed.photos ?? DEFAULT_CONTENT.photos,
      stats: parsed.stats ?? DEFAULT_CONTENT.stats,
      skills: parsed.skills ?? DEFAULT_CONTENT.skills,
      quotes: parsed.quotes ?? DEFAULT_CONTENT.quotes,
      works: parsed.works ?? DEFAULT_CONTENT.works,
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(DEFAULT_CONTENT);
  const [ready, setReady] = useState(false);

  // 客户端水合后再加载，避免 SSR 不一致
  useEffect(() => {
    setContentState(loadFromStorage());
    setReady(true);
  }, []);

  // 持久化
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      // ignore quota issues
    }
  }, [content, ready]);

  // 跨标签同步
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setContentState(JSON.parse(e.newValue));
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

  const reset = useCallback(() => {
    setContentState(DEFAULT_CONTENT);
  }, []);

  const value = useMemo<ContentContextValue>(
    () => ({ content, ready, setContent, updateSection, reset }),
    [content, ready, setContent, updateSection, reset]
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
