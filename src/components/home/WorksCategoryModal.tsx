"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Cat {
  href: string;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

const CATEGORIES: Cat[] = [
  { href: "/software", label: "软件作品", icon: "⚙", desc: "代码 · 产品", color: "#00f0ff" },
  { href: "/skills", label: "技能作品", icon: "◆", desc: "能力图谱", color: "#b14aed" },
  { href: "/gallery", label: "摄影作品", icon: "📷", desc: "光影瞬间", color: "#ff2d95" },
  { href: "/videos", label: "视频作品", icon: "🎬", desc: "动态影像", color: "#00f0ff" },
  { href: "/blog", label: "文章作品", icon: "📝", desc: "文字思想", color: "#b14aed" },
  { href: "/poems", label: "诗词作品", icon: "📜", desc: "诗意表达", color: "#ff2d95" },
];

export default function WorksCategoryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 背景遮罩 + 网格 */}
          <div className="absolute inset-0 bg-cyber-black/85 backdrop-blur-md" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,240,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.25) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* 面板 */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30, rotateX: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-3xl"
          >
            {/* 旋转光环边框 */}
            <div
              className="absolute -inset-1 rounded-2xl opacity-70"
              style={{
                background:
                  "conic-gradient(from 0deg, #00f0ff, #b14aed, #ff2d95, #00f0ff)",
                WebkitMask:
                  "radial-gradient(circle, transparent 70%, black 71%)",
                mask: "radial-gradient(circle, transparent 70%, black 71%)",
                animation: "spin 5s linear infinite",
              }}
            />
            <div className="relative rounded-2xl bg-cyber-dark/90 border border-cyber-blue/30 p-8 md:p-10 shadow-[0_0_60px_rgba(0,240,255,0.25)]">
              {/* 头部 */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2
                    className="font-[family-name:var(--font-orbitron)] text-2xl md:text-3xl text-cyber-blue glitch"
                    data-text="SELECT"
                  >
                    SELECT
                  </h2>
                  <p className="text-gray-400 mt-1 text-sm">
                    // 选择你想探索的作品分类
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-cyber-pink text-2xl leading-none transition-colors"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              {/* 分类网格 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CATEGORIES.map((c, i) => (
                  <motion.button
                    key={c.href}
                    type="button"
                    onClick={() => go(c.href)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.12 + i * 0.07,
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                    whileHover={{
                      scale: 1.07,
                      y: -6,
                      boxShadow: `0 0 28px ${c.color}`,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative cyber-card hud-corner p-5 flex flex-col items-center text-center"
                    style={{ borderColor: c.color + "55" }}
                  >
                    <motion.span
                      className="text-4xl mb-3 block"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      {c.icon}
                    </motion.span>
                    <span
                      className="font-[family-name:var(--font-orbitron)] text-base md:text-lg"
                      style={{ color: c.color }}
                    >
                      {c.label}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-1">
                      {c.desc}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
