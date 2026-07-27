"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

export default function SkillScrollModule() {
  const { content } = useContent();
  const skills = content.myskills;

  if (!skills.length) return null;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <section className="py-6 sm:py-8 select-none">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2
            className="font-[family-name:var(--font-orbitron)] text-lg sm:text-xl text-cyber-purple glitch inline-block"
            data-text="SKILLS"
          >
            SKILLS
          </h2>
          <span className="ml-3 text-xs text-gray-500">// 技能作品</span>
        </div>
        <a
          href="/skills"
          className="text-xs text-gray-500 hover:text-cyber-purple transition-colors border border-cyber-border/30 px-3 py-1 rounded-full hover:border-cyber-purple/30"
        >
          查看全部 →
        </a>
      </div>

      {/* 紧凑型竖向滚动 */}
      <div className="relative overflow-hidden h-[180px] sm:h-[200px]">
        {/* 上下渐变遮罩 */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-cyber-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-cyber-dark to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex flex-col gap-2 will-change-transform"
          animate={{ y: ["0%", "-50%"] }}
          transition={{
            y: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 24,
              ease: "linear",
            },
          }}
        >
          {[...skills, ...skills].map((skill, i) => (
            <div
              key={`${skill.id}-${i}`}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-cyber-border/20 bg-cyber-dark/60 hover:border-cyber-purple/40 hover:bg-cyber-purple/5 transition-all duration-300 shrink-0"
            >
              {/* 图标 */}
              <span className="text-sm shrink-0 w-6 text-center">◆</span>

              {/* 名称 + 描述 */}
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                <span className="text-sm text-white font-medium shrink-0 group-hover:text-cyber-purple transition-colors">
                  {skill.name}
                </span>
                {skill.description && (
                  <span className="text-xs text-gray-500 min-w-0 group-hover:text-gray-400 transition-colors line-clamp-1">
                    {skill.description}
                  </span>
                )}
              </div>

              {/* 链接 + 复制按钮 */}
              {skill.url && (
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a
                    href={skill.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyber-blue hover:text-cyber-blue/80 transition-colors max-w-[140px] truncate font-[family-name:var(--font-mono)]"
                  >
                    {skill.url.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      copyLink(skill.id, skill.url!);
                    }}
                    title="复制链接"
                    aria-label={`复制 ${skill.name} 链接`}
                    className="w-5 h-5 flex items-center justify-center rounded text-[10px] border border-cyber-border/30 hover:border-cyber-purple/50 hover:text-cyber-purple transition-colors cursor-pointer bg-transparent"
                  >
                    {copiedId === skill.id ? "✓" : "📋"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* 底部装饰线 */}
      <div className="mt-3 h-[1px] bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent" />
    </section>
  );
}
