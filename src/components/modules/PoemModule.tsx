"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

/* ---- 切出动效变体 ---- */
const slideVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? 60 : -60,
    scale: 0.92,
    filter: "blur(8px)",
  } as const),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      y: { type: "spring" as const, stiffness: 260, damping: 26 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.45 },
      filter: { duration: 0.5 },
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? -80 : 80,
    scale: 1.06,
    filter: "blur(12px) brightness(1.3)",
    transition: {
      y: { type: "spring" as const, stiffness: 300, damping: 24 },
      opacity: { duration: 0.25 },
      scale: { duration: 0.35 },
      filter: { duration: 0.4 },
    },
  } as const),
};

export default function PoemModule() {
  const { content } = useContent();
  const poems = content.poems;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // poems 列表变化时重置索引
  useEffect(() => {
    if (poems.length === 0) return;
    if (currentIndex >= poems.length) setCurrentIndex(0);
  }, [poems.length, currentIndex]);

  const poem = poems[currentIndex] ?? poems[0];

  // 打字机效果
  useEffect(() => {
    if (!poem || !isTyping) return;
    let charIndex = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (charIndex < poem.content.length) {
        setDisplayedText(poem.content.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 70); // 稍快一点
    return () => clearInterval(timer);
  }, [poem, isTyping]);

  // 触发打字机（在进入动画完成后调用）
  useEffect(() => {
    if (!poem) return;
    setDisplayedText("");
    // 延迟启动打字机，让进入动画先播完
    const t = setTimeout(() => setIsTyping(true), 450);
    return () => clearTimeout(t);
  }, [poem?.id]); // poem.id 变化时重新触发

  // 自动轮播：每 12 秒切下一首
  useEffect(() => {
    if (poems.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % poems.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [poems.length]);

  const nextPoem = useCallback(() => {
    if (poems.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % poems.length);
  }, [poems.length]);

  const prevPoem = useCallback(() => {
    if (poems.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + poems.length) % poems.length);
  }, [poems.length]);

  if (!poem) {
    return (
      <div className="cyber-card p-6 hud-corner text-gray-500 text-sm font-[family-name:var(--font-mono)]">
        // 暂无诗词数据
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-4 sm:p-6 hud-corner"
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-cyber-blue">
          ◈ POETRY MODULE
        </h3>
        <div className="flex items-center gap-2">
          {/* 上一首 */}
          <button
            onClick={prevPoem}
            disabled={poems.length <= 1}
            className="text-xs text-gray-500 hover:text-cyber-blue border border-cyber-border px-2 py-1 hover:border-cyber-blue transition-all disabled:opacity-30 cursor-pointer disabled:cursor-default"
          >
            ◀
          </button>
          {/* 换一首 */}
          <button
            onClick={nextPoem}
            disabled={poems.length <= 1}
            className="text-xs text-gray-500 hover:text-cyber-blue border border-cyber-border px-2 py-1 hover:border-cyber-blue transition-all disabled:opacity-30 cursor-pointer disabled:cursor-default"
          >
            换一首
          </button>
          {/* 查看更多 */}
          <Link
            href="/poems"
            className="text-xs text-cyber-blue/80 hover:text-cyber-blue border border-cyber-blue/40 px-2 py-1 hover:border-cyber-blue hover:shadow-[0_0_10px_rgba(0,229,255,0.35)] transition-all"
          >
            查看更多 →
          </Link>
        </div>
      </div>

      {/* 轮播区域 */}
      <div className="relative min-h-[160px] sm:min-h-[200px] flex flex-col justify-center overflow-hidden rounded-lg">
        {/* 数字雨背景装饰 */}
        <div className="absolute inset-0 opacity-[0.04] overflow-hidden pointer-events-none z-0">
          <div className="text-[7px] text-cyber-green leading-none break-all font-mono select-none">
            {"01".repeat(600)}
          </div>
        </div>

        {/* 扫描线特效 */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-blue/40 to-transparent pointer-events-none z-20"
          animate={{
            top: ["0%", "100%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
        />

        {/* 进度条（底部） */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden z-20">
          <motion.div
            className="h-full bg-gradient-to-r from-cyber-purple via-cyber-blue to-cyber-purple"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "100%"] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* 诗词内容（带切换动画） */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={poem.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative z-10 text-center px-1"
          >
            {/* 标题 — glitch 效果 */}
            <h4
              className="text-base sm:text-lg text-cyber-purple mb-1 font-medium glitch inline-block"
              data-text={poem.title}
            >
              《{poem.title}》
            </h4>

            {/* 元信息 */}
            <p className="text-xs text-gray-500 mb-3 sm:mb-4 font-mono tracking-wide">
              {poem.date} · {poem.author}
            </p>

            {/* 正文 — 打字机输出 */}
            <div className="text-base sm:text-lg leading-relaxed text-gray-200 whitespace-pre-line min-h-[60px] sm:min-h-[80px]">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-0.5 h-5 bg-cyber-blue ml-1 animate-pulse" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
