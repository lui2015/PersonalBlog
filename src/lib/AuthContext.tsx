"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContextValue {
  authed: boolean;
  ready: boolean;
  username: string | null;
  /** 异步登录：成功 true / 失败 false */
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  /** 主动重新检查（如有需要） */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = (await res.json()) as { authed: boolean; username?: string };
        setAuthed(!!data.authed);
        setUsername(data.username ?? null);
      } else {
        setAuthed(false);
        setUsername(null);
      }
    } catch {
      setAuthed(false);
      setUsername(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (u: string, p: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u, password: p }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { ok: boolean; username?: string };
        if (data.ok) {
          setAuthed(true);
          setUsername(data.username ?? u);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      /* ignore */
    }
    setAuthed(false);
    setUsername(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ authed, ready, username, login, logout, refresh }),
    [authed, ready, username, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
