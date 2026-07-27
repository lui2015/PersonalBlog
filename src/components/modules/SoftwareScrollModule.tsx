"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import type { SoftwareWork } from "@/lib/types";

function MarqueeRow({
  items,
  direction = "left",
  speed = 40,
}: {
  items: SoftwareWork[];
  direction?: "left" | "right";
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // 无限滚动：复制一份首尾相接
  const dup = [...items, ...items];

  return (
    <div
      ref={ref}
      className="flex overflow-hidden"
      style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
    >
      <motion.div
        className="flex gap-3 sm:gap-5 shrink-0 will-change-transform"
        animate={{ x: direction === "left" ? [0, "-50%"] : ["-50%", 0] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
        onHoverStart={() => {}}
      >
        {dup.map((s, i) => (
          <a
            key={`${s.id}-${i}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative shrink-0 w-[200px] sm:w-[300px] rounded-xl overflow-hidden border border-cyber-blue/25 bg-cyber-dark/80 hover:border-cyber-blue hover:shadow-[0_0_24px_rgba(0,240,255,0.3)] transition-all duration-300"
          >
            {/* 封面 */}
            <div className="relative h-[100px] sm:h-[160px] bg-cyber-black overflow-hidden">
              <img
                src={s.image || "/placeholder.jpg"}
                alt={s.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark via-transparent to-transparent" />
              {/* 角标 */}
              <div className="absolute top-2 right-2 text-xs font-[family-name:var(--font-mono)] text-cyber-blue bg-cyber-black/70 px-2 py-0.5 rounded border border-cyber-blue/30">
                ⚙ 软件
              </div>
            </div>
            {/* 信息 */}
            <div className="p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm text-cyber-blue font-medium truncate">
                {s.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed">
                {s.description}
              </p>
              <span className="inline-block mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-gray-600 group-hover:text-cyber-pink transition-colors">
                点击访问 ↗
              </span>
            </div>
          </a>
        ))}
      </motion.div>
    </div>
  );
}

export default function SoftwareScrollModule() {
  const { content } = useContent();
  const softwares = content.softwares;

  if (!softwares.length) return null;

  return (
    <section className="py-6 sm:py-14 select-none">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <div>
          <h2
            className="font-[family-name:var(--font-orbitron)] text-lg sm:text-2xl text-cyber-blue glitch inline-block"
            data-text="SOFTWARE"
          >
            SOFTWARE
          </h2>
          <span className="ml-3 text-xs text-gray-500">// 软件作品</span>
        </div>
        <a
          href="/software"
          className="text-xs text-gray-500 hover:text-cyber-pink transition-colors border border-cyber-border/30 px-3 py-1 rounded-full hover:border-cyber-pink/30"
        >
          查看全部 →
        </a>
      </div>

      {/* 滚动行 */}
      <MarqueeRow items={softwares} direction="left" speed={36} />

      {/* 第二行反向滚动（如果内容多） */}
      {softwares.length >= 3 && (
        <div className="mt-3 sm:mt-5">
          <MarqueeRow
            items={[...softwares].reverse()}
            direction="right"
            speed={44}
          />
        </div>
      )}
    </section>
  );
}
