"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { href: "/admin", label: "总览", icon: "◈" },
  { href: "/admin/hero", label: "首页 · 主屏", icon: "◇" },
  { href: "/admin/poems", label: "首页 · 诗词", icon: "✦" },
  { href: "/admin/photos", label: "首页 · 相框", icon: "◫" },
  { href: "/admin/stats", label: "首页 · 数据", icon: "▤" },
  { href: "/admin/skills", label: "首页 · 技能", icon: "▲" },
  { href: "/admin/quotes", label: "首页 · 语录", icon: "❝" },
  { href: "/admin/works", label: "我的作品", icon: "✎" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { authed, ready, logout } = useAuth();

  // 登录页本身不做拦截
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!ready) return;
    if (!authed && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [authed, ready, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="relative z-10 pt-24 text-center text-gray-500 font-[family-name:var(--font-mono)]">
        // 正在校验身份...
      </div>
    );
  }

  if (!authed) {
    return null; // 即将跳转登录
  }

  return (
    <div className="relative z-10 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-block px-2 py-0.5 border border-cyber-pink/50 text-cyber-pink text-[10px] font-[family-name:var(--font-mono)] tracking-widest mb-2">
              // CONTROL PANEL
            </div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-2xl md:text-3xl text-cyber-blue">
              鲁力铭 · 后台管理
            </h1>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="text-xs text-gray-400 hover:text-cyber-pink border border-cyber-border hover:border-cyber-pink px-3 py-1.5 transition-all font-[family-name:var(--font-mono)]"
          >
            ⏻ LOGOUT
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          {/* 侧边栏 */}
          <aside className="cyber-card p-3 h-fit lg:sticky lg:top-24">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-all border-l-2 ${
                      active
                        ? "border-cyber-blue text-cyber-blue bg-cyber-blue/10"
                        : "border-transparent text-gray-400 hover:text-cyber-blue hover:border-cyber-blue/40"
                    }`}
                  >
                    <span className="opacity-70">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* 内容区 */}
          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}
