"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import type { Video } from "@/lib/types";

function VideoMarqueeRow({
  items,
  direction = "left",
  speed = 42,
}: {
  items: Video[];
  direction?: "left" | "right";
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dup = [...items, ...items];

  return (
    <div
      ref={ref}
      className="flex overflow-hidden"
      style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
    >
      <motion.div
        className="flex gap-5 shrink-0 will-change-transform"
        animate={{ x: direction === "left" ? [0, "-50%"] : ["-50%", 0] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {dup.map((v, i) => (
          <a
            key={`${v.id}-${i}`}
            href={v.src || "#"}
            target={v.src ? "_blank" : undefined}
            rel={v.src ? "noopener noreferrer" : undefined}
            className="group relative shrink-0 w-[320px] sm:w-[380px] rounded-xl overflow-hidden border border-cyber-pink/25 bg-cyber-dark/80 hover:border-cyber-pink hover:shadow-[0_0_28px_rgba(255,0,128,0.25)] transition-all duration-300"
          >
            {/* 封面区 — 横版 16:9 */}
            <div className="relative aspect-video bg-cyber-black overflow-hidden">
              <img
                src={v.cover || "/placeholder.jpg"}
                alt={v.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* 居中播放按钮 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-14 h-14 rounded-full bg-cyber-pink/20 backdrop-blur-md border border-cyber-pink/50 flex items-center justify-center group-hover:bg-cyber-pink/40 group-hover:border-cyber-pink group-hover:scale-110 transition-all duration-300"
                  whileHover={{ scale: 1.15 }}
                >
                  <span className="text-lg text-white ml-1">▶</span>
                </motion.div>
              </div>

              {/* 时长标签 */}
              <div className="absolute bottom-2.5 right-2.5 text-xs font-[family-name:var(--font-mono)] text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
                {v.duration || "--:--"}
              </div>

              {/* 左上角分类角标 */}
              <div className="absolute top-2 left-2 text-xs font-[family-name:var(--font-mono)] text-cyber-pink bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-cyber-pink/30">
                🎬 视频
              </div>
            </div>

            {/* 信息区 */}
            <div className="p-4">
              <h3 className="text-sm text-cyber-pink font-medium truncate group-hover:text-white transition-colors">
                {v.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>{v.category}</span>
                <span className="inline-block w-1 h-1 rounded-full bg-gray-600" />
                <span>{v.views || ""} 次观看</span>
              </p>
            </div>

            {/* 底部发光条 */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-cyber-pink/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
        ))}
      </motion.div>
    </div>
  );
}

export default function VideoScrollModule() {
  const { content } = useContent();
  const videos = content.videos;

  if (!videos.length) return null;

  return (
    <section className="py-10 sm:py-14 select-none">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2
            className="font-[family-name:var(--font-orbitron)] text-xl sm:text-2xl text-cyber-pink glitch inline-block"
            data-text="VIDEOS"
          >
            VIDEOS
          </h2>
          <span className="ml-3 text-xs text-gray-500">// 视频作品</span>
        </div>
        <a
          href="/videos"
          className="text-xs text-gray-500 hover:text-cyber-pink transition-colors border border-cyber-border/30 px-3 py-1 rounded-full hover:border-cyber-pink/30"
        >
          查看全部 →
        </a>
      </div>

      {/* 第一行 */}
      <VideoMarqueeRow items={videos} direction="right" speed={42} />

      {/* 第二行反向（内容多时） */}
      {videos.length >= 3 && (
        <VideoMarqueeRow
          items={[...videos].reverse()}
          direction="left"
          speed={52}
        />
      )}
    </section>
  );
}
