"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

export default function QuoteModule() {
  const { content } = useContent();
  const quotes = content.quotes;
  const [current, setCurrent] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (current >= quotes.length) setCurrent(0);
  }, [quotes.length, current]);

  const quote = quotes[current] ?? quotes[0];

  // 打字机
  useEffect(() => {
    if (!quote) return;
    let i = 0;
    setDisplayText("");
    setIsTyping(true);
    const timer = setInterval(() => {
      if (i < quote.text.length) {
        setDisplayText(quote.text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 35);
    return () => clearInterval(timer);
  }, [quote, current]);

  // 自动轮播（停留时间随文本长度自适应，至少 8s）
  useEffect(() => {
    if (!quotes.length || quotes.length <= 1) return;
    const duration = Math.max(8000, quote.text.length * 40 + 2000);
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [quotes.length, current, quote?.text]);

  // 手动切换
  const switchTo = useCallback(
    (idx: number) => {
      if (quotes.length <= 1) return;
      setCurrent(((idx % quotes.length) + quotes.length) % quotes.length);
    },
    [quotes.length]
  );

  const next = useCallback(() => switchTo(current + 1), [switchTo, current]);

  if (quotes.length === 0) {
    return (
      <div className="cyber-card p-6 hud-corner text-gray-500 text-sm font-[family-name:var(--font-mono)] flex items-center justify-center min-h-[250px]">
        // 暂无语录
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-4 sm:p-6 hud-corner flex flex-col justify-center min-h-[200px] sm:min-h-[250px] cursor-pointer group"
      onClick={next}
      role="button"
      aria-label="切换下一条语录"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-cyber-green">
          ◈ RANDOM QUOTE
        </h3>
        {/* 切换提示 */}
        <span className="text-[10px] text-gray-600 group-hover:text-cyber-green/80 transition-colors font-mono select-none">
          点击切换 ↻
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm sm:text-lg text-gray-200 font-[family-name:var(--font-mono)] leading-relaxed mb-4 break-words">
              <span className="text-cyber-green mr-2">$</span>
              {displayText}
              {isTyping && (
                <span className="inline-block w-2 h-5 bg-cyber-green/80 ml-1 animate-pulse" />
              )}
            </p>
            <p className="text-sm text-gray-500 text-right">— {quote.author}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 操作栏 */}
      <div className="mt-4 pt-3 border-t border-cyber-border/40 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="text-xs text-gray-500 hover:text-cyber-green border border-cyber-border px-2.5 py-1 rounded hover:border-cyber-green/40 transition-all cursor-pointer"
        >
          换一条 ↻
        </button>
        <Link
          href="/quotes"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-cyber-green/80 hover:text-cyber-green border border-cyber-green/40 px-2.5 py-1 rounded hover:shadow-[0_0_10px_rgba(0,255,128,0.3)] transition-all"
        >
          查看更多思考 →
        </Link>
      </div>
    </motion.div>
  );
}
