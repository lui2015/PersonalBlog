"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

export default function PoemModule() {
  const { content } = useContent();
  const poems = content.poems;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  // poems 列表变化时重置索引
  useEffect(() => {
    if (currentIndex >= poems.length) setCurrentIndex(0);
  }, [poems.length, currentIndex]);

  const poem = poems[currentIndex] ?? poems[0];

  useEffect(() => {
    if (!poem) return;
    let charIndex = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (charIndex < poem.content.length) {
        setDisplayedText(poem.content.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [poem]);

  const nextPoem = () => {
    if (poems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % poems.length);
  };

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-cyber-blue">
          ◈ POETRY MODULE
        </h3>
        <button
          onClick={nextPoem}
          className="text-xs text-gray-500 hover:text-cyber-blue border border-cyber-border px-2 py-1 hover:border-cyber-blue transition-all"
        >
          换一首
        </button>
      </div>

      <div className="relative min-h-[160px] sm:min-h-[200px] flex flex-col justify-center">
        {/* 数字雨背景装饰 */}
        <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
          <div className="text-[8px] text-cyber-green leading-none break-all">
            {"01".repeat(500)}
          </div>
        </div>

        <div className="relative z-10 text-center">
          <h4 className="text-base sm:text-lg text-cyber-purple mb-1 font-medium">
            {poem.title}
          </h4>
          <p className="text-xs text-gray-500 mb-3 sm:mb-4">
            [{poem.dynasty}] {poem.author}
          </p>
          <div className="text-base sm:text-lg leading-relaxed text-gray-200 whitespace-pre-line min-h-[60px] sm:min-h-[80px]">
            {displayedText}
            <span className="inline-block w-0.5 h-5 bg-cyber-blue ml-1 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
