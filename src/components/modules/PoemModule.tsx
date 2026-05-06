"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const poems = [
  {
    title: "静夜思",
    author: "李白",
    dynasty: "唐",
    content: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。",
  },
  {
    title: "登鹳雀楼",
    author: "王之涣",
    dynasty: "唐",
    content: "白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。",
  },
  {
    title: "春晓",
    author: "孟浩然",
    dynasty: "唐",
    content: "春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。",
  },
  {
    title: "望庐山瀑布",
    author: "李白",
    dynasty: "唐",
    content: "日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。",
  },
];

export default function PoemModule() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const poem = poems[currentIndex];

  useEffect(() => {
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
  }, [currentIndex, poem.content]);

  const nextPoem = () => {
    setCurrentIndex((prev) => (prev + 1) % poems.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-6 hud-corner"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-orbitron)] text-sm text-cyber-blue">
          ◈ POETRY MODULE
        </h3>
        <button
          onClick={nextPoem}
          className="text-xs text-gray-500 hover:text-cyber-blue border border-cyber-border px-2 py-1 hover:border-cyber-blue transition-all"
        >
          换一首
        </button>
      </div>

      <div className="relative min-h-[200px] flex flex-col justify-center">
        {/* 数字雨背景装饰 */}
        <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
          <div className="text-[8px] text-cyber-green leading-none break-all">
            {"01".repeat(500)}
          </div>
        </div>

        <div className="relative z-10 text-center">
          <h4 className="text-lg text-cyber-purple mb-1 font-medium">
            {poem.title}
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            [{poem.dynasty}] {poem.author}
          </p>
          <div className="text-lg leading-relaxed text-gray-200 whitespace-pre-line min-h-[80px]">
            {displayedText}
            <span className="inline-block w-0.5 h-5 bg-cyber-blue ml-1 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
