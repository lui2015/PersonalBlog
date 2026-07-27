"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "首页", icon: "⌂" },
];

const worksChildren = [
  { href: "/software", label: "软件作品", icon: "⚙" },
  { href: "/skills", label: "技能作品", icon: "◆" },
  { href: "/gallery", label: "摄影作品", icon: "📷" },
  { href: "/videos", label: "视频作品", icon: "🎬" },
  { href: "/blog", label: "文章作品", icon: "📝" },
  { href: "/poems", label: "诗词作品", icon: "📜" },
];

const afterWorksItems = [
  { href: "/about", label: "关于我", icon: "◈" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [worksOpen, setWorksOpen] = useState(false);
  const worksRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (worksRef.current && !worksRef.current.contains(e.target as Node)) {
        setWorksOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-cyber-black/70 border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo：单击回首页；双击进入 TargetSystem */}
          <Link
            href="/"
            className="flex items-center space-x-2 group select-none"
            title="单击回首页 · 双击进入 TargetSystem"
            onDoubleClick={(e) => {
              e.preventDefault();
              window.open(
                "https://www.luliming.xyz/TargetSystem/",
                "_blank",
                "noopener,noreferrer"
              );
            }}
          >
            <span className="font-[family-name:var(--font-orbitron)] text-xl text-cyber-blue neon-text group-hover:text-cyber-purple transition-colors">
              鲁力铭
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-cyber-blue transition-colors group"
              >
                <span className="mr-1 opacity-50">{item.icon}</span>
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyber-blue group-hover:w-full transition-all duration-300 shadow-[0_0_5px_var(--color-cyber-blue)]" />
              </Link>
            ))}

            {/* 我的作品 - 下拉 */}
            <div ref={worksRef} className="relative">
              <button
                onClick={() => setWorksOpen(!worksOpen)}
                onMouseEnter={() => setWorksOpen(true)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                  worksOpen ? "text-cyber-blue" : "text-gray-300 hover:text-cyber-blue"
                }`}
              >
                <span className="opacity-50">✦</span> 我的作品
                <motion.svg
                  animate={{ rotate: worksOpen ? 180 : 0 }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 ml-0.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </motion.svg>
                <span className={`absolute bottom-0 left-0 h-[2px] bg-cyber-blue transition-all duration-300 ${worksOpen ? "w-full" : "w-0"} shadow-[0_0_5px_var(--color-cyber-blue)]`} />
              </button>

              <AnimatePresence>
                {worksOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    onMouseLeave={() => setWorksOpen(false)}
                    className="absolute top-full left-0 mt-1 w-48 bg-cyber-black/95 backdrop-blur-xl border border-cyber-border rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,200,255,0.1)] z-50"
                  >
                    {worksChildren.map((sub) => {
                      const isExternal = sub.href.startsWith("http");
                      const Tag = isExternal ? "a" : Link;
                      const extraProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
                      return (
                        <Tag
                          key={sub.href!}
                          href={sub.href!}
                          {...extraProps}
                          onClick={() => setWorksOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-cyber-blue hover:bg-cyber-blue/10 transition-colors flex items-center gap-2 border-b border-cyber-border/30 last:border-0"
                        >
                          <span className="opacity-60">{sub.icon}</span>
                          {sub.label}
                        </Tag>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {afterWorksItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-cyber-blue transition-colors group"
              >
                <span className="mr-1 opacity-50">{item.icon}</span>
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyber-blue group-hover:w-full transition-all duration-300 shadow-[0_0_5px_var(--color-cyber-blue)]" />
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-cyber-blue p-2"
          >
            <div className="space-y-1.5">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block w-6 h-0.5 bg-cyber-blue"
              />
              <motion.span
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-6 h-0.5 bg-cyber-blue"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block w-6 h-0.5 bg-cyber-blue"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 top-16 bg-cyber-black/95 backdrop-blur-lg z-40 scanlines"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-[family-name:var(--font-orbitron)] text-gray-300 hover:text-cyber-blue transition-colors"
                  >
                    <span className="mr-3 text-cyber-purple">{item.icon}</span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* 我的作品 - 移动端子菜单 */}
              <WorksMobileSection onClose={() => setIsOpen(false)} />

              {afterWorksItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navItems.length + i + 2) * 0.08 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-[family-name:var(--font-orbitron)] text-gray-300 hover:text-cyber-blue transition-colors"
                  >
                    <span className="mr-3 text-cyber-purple">{item.icon}</span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/** 移动端：我的作品可展开子项 */
function WorksMobileSection({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (navItems.length + 1) * 0.08 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-2xl font-[family-name:var(--font-orbitron)] text-cyber-blue transition-colors flex items-center gap-3"
      >
        <span className="text-cyber-purple">✦</span>
        我的作品
        <motion.svg
          animate={{ rotate: expanded ? 180 : 0 }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 ml-1"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-6 pt-3 space-y-4"
          >
            {worksChildren.map((sub) => {
              const isExternal = sub.href.startsWith("http");
              const Tag = isExternal ? "a" : Link;
              const extraProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Tag
                  key={sub.href!}
                  href={sub.href!}
                  {...extraProps}
                  onClick={onClose}
                  className="block text-lg text-gray-300 hover:text-cyber-blue transition-colors flex items-center gap-2"
                >
                  <span>{sub.icon}</span> {sub.label}
                </Tag>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
