"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "首页", icon: "⌂" },
  { href: "/about", label: "关于我", icon: "◈" },
  { href: "/blog", label: "我的作品", icon: "✦" },
  { href: "https://www.luliming.xyz/tools/", label: "我的工具", icon: "⚙" },
  { href: "/videos", label: "视频", icon: "▶" },
  { href: "/gallery", label: "相册", icon: "◫" },
  { href: "/download", label: "下载", icon: "⬇" },
  { href: "/skills", label: "我的技能", icon: "◆" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
            {navItems.map((item) => {
              const isExternal = item.href.startsWith("http");
              const Tag = isExternal ? "a" : Link;
              const extraProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Tag
                  key={item.href}
                  href={item.href}
                  {...extraProps}
                  className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-cyber-blue transition-colors group"
                >
                  <span className="mr-1 opacity-50">{item.icon}</span>
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-cyber-blue group-hover:w-full transition-all duration-300 shadow-[0_0_5px_var(--color-cyber-blue)]" />
                </Tag>
              );
            })}
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
              {navItems.map((item, i) => {
                const isExternal = item.href.startsWith("http");
                const Tag = isExternal ? "a" : Link;
                const extraProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Tag
                      href={item.href}
                      {...extraProps}
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-[family-name:var(--font-orbitron)] text-gray-300 hover:text-cyber-blue transition-colors"
                    >
                      <span className="mr-3 text-cyber-purple">{item.icon}</span>
                      {item.label}
                    </Tag>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
