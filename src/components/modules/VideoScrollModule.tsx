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
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
              isActive
                ? "bg-cyber-pink/40 border-cyber-pink"
                : "bg-black/40 border-white/20 group-hover:bg-cyber-pink/30 group-hover:border-cyber-pink/50"
            }`}
          >
            <span className="text-white text-[9px] ml-0.5">▶</span>
          </div>
        </div>

        {/* 时长 */}
        <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono text-white bg-black/70 px-1 py-px rounded">
          {video.duration || "--:--"}
        </span>
      </div>

      {/* 标题 + 描述 */}
      <div className="p-1.5">
        <p className={`text-xs font-medium truncate leading-tight transition-colors ${isActive ? "text-cyber-pink" : "text-gray-300 group-hover:text-white"}`}>
          {video.title}
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 font-mono">
          <span>{video.category}</span>
          {video.views && (
            <>
              <span className="inline-block w-1 h-1 rounded-full bg-gray-600" />
              <span>{video.views}次</span>
            </>
          )}
        </p>
      </div>
    </button>
  );
}

/* ---- 纵向无限滚动 marquee（两列并排，各自向上/向下循环，hover 暂停） ---- */
function VerticalMarquee({
  videos,
  activeIndex,
  onSelect,
}: {
  videos: Video[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const HEIGHT = 480; // 与左侧主卡高度大致对齐，消除底部留白

  // 按奇偶拆成左右两列，保持原始顺序
  const leftVideos = videos.filter((_, i) => i % 2 === 0);
  const rightVideos = videos.filter((_, i) => i % 2 === 1);

  return (
    <div
      className="grid grid-cols-2 gap-1.5 group/marquee"
      style={{
        height: HEIGHT,
        maskImage:
          "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)",
      }}
    >
      <MarqueeColumn
        videos={leftVideos}
        offset={0}
        activeIndex={activeIndex}
        onSelect={onSelect}
        direction="up"
        speed={24}
      />
      <MarqueeColumn
        videos={rightVideos}
        offset={1}
        activeIndex={activeIndex}
        onSelect={onSelect}
        direction="down"
        speed={28}
      />

      {/* 纵向 marquee 关键帧 + hover 暂停 */}
      <style jsx global>{`
        @keyframes vmarquee-up {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
        @keyframes vmarquee-down {
          from {
            transform: translateY(-50%);
          }
          to {
            transform: translateY(0);
          }
        }
        .group\\/marquee:hover .vmarquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

/* 单列纵向无限滚动（纯 CSS 动画，hover 整个 marquee 时暂停） */
function MarqueeColumn({
  videos,
  offset,
  activeIndex,
  onSelect,
  direction = "up",
  speed = 24,
}: {
  videos: Video[];
  offset: number; // 该列视频在原数组中的下标偏移（0=左列偶数, 1=右列奇数）
  activeIndex: number;
  onSelect: (i: number) => void;
  direction?: "up" | "down";
  speed?: number;
}) {
  if (!videos.length) return null;
  const animName = direction === "up" ? "vmarquee-up" : "vmarquee-down";
  return (
    <div className="relative overflow-hidden h-full">
      <div
        className="vmarquee-track flex flex-col gap-1.5 will-change-transform"
        style={{
          animation: `${animName} ${speed}s linear infinite`,
        }}
      >
        {[...videos, ...videos].map((v, i) => {
          const realIdx = offset + (i % videos.length) * 2;
          return (
            <div key={`${v.id}-${i}`} className="shrink-0">
              <ThumbCard
                video={v}
                isActive={realIdx === activeIndex}
                onClick={() => onSelect(realIdx)}
              />
            </div>
          );
        })}
      </div>
    </div>
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

        {/* 缩略图列表：桌面端两列纵向自动无限滚动（hover 暂停） */}
        <div className="hidden lg:block lg:w-[42%]">
          <VerticalMarquee
            videos={videos}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>

        {/* 移动端：横向滑动 */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory lg:hidden"
          style={{ scrollbarWidth: "none" }}
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

      {/* 底部装饰线 */}
      <div className="mt-3 sm:mt-4 h-[1px] bg-gradient-to-r from-transparent via-cyber-pink/30 to-transparent" />
    </section>
  );
}
