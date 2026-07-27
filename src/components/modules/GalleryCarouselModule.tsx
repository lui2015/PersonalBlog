"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import type { GalleryAlbum } from "@/lib/types";

/* ---- 单张照片卡片 ---- */
function PhotoCard({
  photo,
  index,
  total,
}: {
  photo: { id: string; src: string; title: string };
  index: number;
  total: number;
}) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden group">
      {/* 图片 */}
      <img
        src={photo.src}
        alt={photo.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* 底部信息栏 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-white font-medium text-base sm:text-lg truncate"
        >
          {photo.title}
        </motion.p>
        <p className="text-xs text-gray-400 mt-1 font-[family-name:var(--font-mono)]">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>

      {/* 角标装饰 */}
      <div className="absolute top-3 right-3 w-8 h-8 border border-cyber-pink/40 rounded-full flex items-center justify-center text-[10px] text-cyber-pink bg-black/50 backdrop-blur-sm">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyber-pink" />
      </div>
    </div>
  );
}

/* ---- 切换动效覆盖层 ---- */
function TransitionOverlay({ direction }: { direction: number }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 pointer-events-none flex"
      initial={{ x: direction > 0 ? "-100%" : "100%" }}
      animate={{
        x: ["0%", "0%"],
      }}
      exit={{ x: direction > 0 ? "100%" : "-100%" }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* 扫光条 */}
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyber-pink/30 to-transparent"
        initial={{ x: direction > 0 ? "-100%" : "100%" }}
        animate={{ x: direction > 0 ? "200%" : "-200%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

/* ---- 主模块 ---- */
export default function GalleryCarouselModule() {
  const { content } = useContent();
  const albums: GalleryAlbum[] = content.albums;

  if (!albums.length) return null;

  // 收集所有相册的照片
  const allPhotos = albums.flatMap((album) =>
    album.photos.map((p) => ({ ...p, _album: album.name }))
  );
  if (!allPhotos.length) return null;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  // 自动播放（每 5 秒），手动操作时暂停
  useEffect(() => {
    if (isAutoPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % allPhotos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [allPhotos.length, isAutoPaused]);

  const go = useCallback(
    (dir: number) => {
      setIsAutoPaused(true);
      setDirection(dir);
      setCurrent((prev) => {
        const next = prev + dir;
        if (next < 0) return allPhotos.length - 1;
        if (next >= allPhotos.length) return 0;
        return next;
      });
      // 15秒后恢复自动
      setTimeout(() => setIsAutoPaused(false), 15000);
    },
    [allPhotos.length]
  );

  const photo = allPhotos[current];

  return (
    <section className="py-6 sm:py-10 select-none">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <div>
          <h2
            className="font-[family-name:var(--font-orbitron)] text-lg sm:text-2xl text-cyber-pink glitch inline-block"
            data-text="GALLERY"
          >
            GALLERY
          </h2>
          <span className="ml-3 text-xs text-gray-500">// 摄影作品</span>
        </div>
        <a
          href="/gallery"
          className="text-xs text-gray-500 hover:text-cyber-pink transition-colors border border-cyber-border/30 px-3 py-1 rounded-full hover:border-cyber-pink/30"
        >
          查看全部 →
        </a>
      </div>

      {/* 轮播主体 */}
      <div className="relative h-[240px] sm:h-[360px] lg:h-[420px] rounded-xl overflow-hidden border border-cyber-pink/20 bg-cyber-dark/80">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={photo.id}
            custom={direction}
            initial={{
              opacity: 0,
              x: direction > 0 ? 120 : -120,
              scale: 0.95,
            }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{
              opacity: 0,
              x: direction > 0 ? -120 : 120,
              scale: 0.95,
            }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0"
          >
            <PhotoCard photo={photo} index={current} total={allPhotos.length} />
          </motion.div>
        </AnimatePresence>

        {/* 左右切换按钮 */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="上一张"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-cyber-pink hover:border-cyber-pink/50 hover:bg-black/80 transition-all duration-300 active:scale-90 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="下一张"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-cyber-pink hover:border-cyber-pink/50 hover:bg-black/80 transition-all duration-300 active:scale-90 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* 底部指示器 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {allPhotos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setIsAutoPaused(true);
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
                setTimeout(() => setIsAutoPaused(false), 15000);
              }}
              aria-label={`跳到第 ${i + 1} 张`}
              className={`cursor-pointer transition-all duration-300 rounded-full ${
                i === current
                  ? "w-6 h-2 bg-cyber-pink shadow-[0_0_8px_rgba(236,72,153,0.5)]"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* 相册名称标签 */}
        {photo._album && (
          <div className="absolute top-3 left-3 z-20 text-[11px] text-gray-400 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5 font-[family-name:var(--font-mono)]">
            📷 {photo._album}
          </div>
        )}
      </div>

      {/* 底部装饰线 */}
      <div className="mt-3 sm:mt-4 h-[1px] bg-gradient-to-r from-transparent via-cyber-pink/30 to-transparent" />
    </section>
  );
}
