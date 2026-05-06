"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { authed, ready, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && authed) {
      router.replace("/admin");
    }
  }, [ready, authed, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const ok = await login(username.trim(), password);
      if (ok) {
        router.replace("/admin");
      } else {
        setError("身份核验失败：账号或密码错误");
        setSubmitting(false);
      }
    } catch {
      setError("网络异常，请稍后重试");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md cyber-card hud-corner p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 border border-cyber-pink/50 text-cyber-pink text-[10px] font-[family-name:var(--font-mono)] tracking-widest mb-4">
            // RESTRICTED ZONE
          </div>
          <h1
            className="font-[family-name:var(--font-orbitron)] text-3xl text-cyber-blue glitch"
            data-text="ADMIN LOGIN"
          >
            ADMIN LOGIN
          </h1>
          <p className="mt-3 text-sm text-gray-500 font-[family-name:var(--font-mono)]">
            {">"} 请输入管理员凭证以进入控制台
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-cyber-blue mb-2 font-[family-name:var(--font-mono)] tracking-widest">
              [USERNAME]
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-cyber-black/60 border border-cyber-border px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_var(--color-cyber-blue)] transition-all font-[family-name:var(--font-mono)]"
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-cyber-blue mb-2 font-[family-name:var(--font-mono)] tracking-widest">
              [PASSWORD]
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cyber-black/60 border border-cyber-border px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_var(--color-cyber-blue)] transition-all font-[family-name:var(--font-mono)]"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-cyber-pink font-[family-name:var(--font-mono)] border border-cyber-pink/40 bg-cyber-pink/10 px-3 py-2"
            >
              ✗ {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 border border-cyber-blue text-cyber-blue font-[family-name:var(--font-orbitron)] text-sm hover:bg-cyber-blue/10 hover:shadow-[0_0_20px_var(--color-cyber-blue)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "AUTHENTICATING..." : "ENTER SYSTEM →"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-cyber-border/30 text-center">
          <p className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
            {"// AUTH SERVICE v1.0 | LOCAL VAULT"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
