"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import type { Video } from "@/lib/types";

/* ---- 精选主卡片（大） ---- */
function FeaturedCard({ video }: { video: Video }) {
  return (
    <a
      href={video.src || "#"}
      target={video.src ? "_blank" : undefined}
      rel={video.src ? "noopener noreferrer" : undefined}
      className="group relative block w-full h-full rounded-xl overflow-hidden border border-cyber-pink/25 bg-cyber-dark/80 hover:border-cyber-pink hover:shadow-[0_0_32px_rgba(255,0,128,0.3)] transition-all duration-400"
    >
      {/* 封面 */}
      <div className="relative aspect-video bg-cyber-black overflow-hidden">
        <img
          src={video.cover || "/placeholder.jpg"}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* 播放按钮 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          whileHover={{ scale: 1.08 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyber-pink/25 backdrop-blur-md border-2 border-cyber-pink/60 flex items-center justify-center group-hover:bg-cyber-pink/45 group-hover:border-cyber-pink group-hover:shadow-[0_0_24px_rgba(255,0,128,0.5)] transition-all duration-300"
          >
            <span className="text-white text-xl sm:text-2xl ml-1">▶</span>
          </motion.div>
        </motion.div>

        {/* 时长 */}
        <span className="absolute bottom-3 right-3 text-xs font-mono text-white bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
          {video.duration || "--:--"}
        </span>
        <span className="absolute top-3 left-3 text-xs font-mono text-cyber-pink bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-cyber-pink/30">
          🎬 {video.category}
        </span>
      </div>

      {/* 信息区 */}
      <div className="p-4 sm:p-5">
        <h3 className="text-base sm:text-lg text-cyber-pink font-semibold group-hover:text-white transition-colors line-clamp-2 leading-snug">
          {video.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 flex items-center gap-2 font-mono">
          <span>{video.category}</span>
          <span className="inline-block w-1 h-1 rounded-full bg-gray-600" />
          <span>{video.views || ""} 次观看</span>
        </p>
      </div>

      {/* 底部发光条 */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-cyber-pink/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

/* ---- 缩略图卡片（小） ---- */
function ThumbCard({
  video,
  isActive,
  onClick,
}: {
  video: Video;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative shrink-0 w-[120px] sm:w-[160px] lg:w-full rounded-lg overflow-hidden border transition-all duration-300 cursor-pointer text-left ${
        isActive
          ? "border-cyber-pink shadow-[0_0_20px_rgba(255,0,128,0.35)] scale-[1.02]"
          : "border-white/10 hover:border-cyber-pink/40"
      }`}
    >
      {/* 封面 */}
      <div className="relative aspect-video bg-cyber-black overflow-hidden">
        <img
          src={video.cover || "/placeholder.jpg"}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* 播放图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
              isActive
                ? "bg-cyber-pink/40 border-cyber-pink"
                : "bg-black/40 border-white/20 group-hover:bg-cyber-pink/30 group-hover:border-cyber-pink/50"
            }`}
          >
            <span className="text-white text-xs ml-0.5">▶</span>
          </div>
        </div>

        {/* 时长 */}
        <span className="absolute bottom-1.5 right-1.5 text-[10px] font-mono text-white bg-black/70 px-1.5 py-0.5 rounded">
          {video.duration || "--:--"}
        </span>
      </div>

      {/* 标题 */}
      <div className="p-2">
        <p className={`text-[11px] sm:text-xs truncate transition-colors ${isActive ? "text-cyber-pink" : "text-gray-400 group-hover:text-gray-200"}`}>
          {video.title}
        </p>
      </div>
    </button>
  );
}

/* ---- 主模块：精选 + 横向缩略图条 ---- */
export default function VideoScrollModule() {
  const { content } = useContent();
  const videos: Video[] = content.videos;

  if (!videos.length) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = videos[activeIndex];

  return (
    <section className="py-6 sm:py-10 select-none">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <div>
          <h2
            className="font-[family-name:var(--font-orbitron)] text-lg sm:text-2xl text-cyber-pink glitch inline-block"
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

      {/* 布局：左大右小（桌面） / 上大下小（移动端） */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
        {/* 精选主卡 */}
        <div className="lg:w-[58%] shrink-0 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeVideo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <FeaturedCard video={activeVideo} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 缩略图列表：桌面端两列纵向可滚动 */}
        <div className="lg:flex-1 lg:min-h-[420px]">
          <div
            className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-2 lg:gap-2.5 lg:overflow-y-auto lg:overflow-x-hidden lg:snap-none lg:max-h-[420px] lg:p-0"
            style={{
              scrollbarWidth: "thin",
              msOverflowStyle: "none",
            }}
          >
            {videos.map((v, i) => (
              <ThumbCard
                key={v.id}
                video={v}
                isActive={i === activeIndex}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="mt-3 sm:mt-4 h-[1px] bg-gradient-to-r from-transparent via-cyber-pink/30 to-transparent" />
    </section>
  );
}
