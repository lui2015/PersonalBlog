"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import type { GalleryAlbum } from "@/lib/types";

/* ---- Lightbox 全屏预览 ---- */
function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: { id: string; src: string; title: string; _album?: string }[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const photo = photos[index];

  // 键盘导航
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, photos.length]);

  const go = useCallback(
    (dir: number) =>
      setIndex((i) => {
        const next = i + dir;
        if (next < 0) return photos.length - 1;
        if (next >= photos.length) return 0;
        return next;
      }),
    [photos.length]
  );

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* 关闭按钮 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭"
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
      >
        ✕
      </button>

      {/* 图片区域 */}
      <div className="relative w-full max-w-5xl max-h-[85vh] mx-4 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.3 }}
            className="relative w-full flex flex-col items-center"
          >
            <img
              src={photo.src}
              alt={photo.title}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />
            {/* 信息栏 */}
            <div className="mt-4 text-center">
              <p className="text-white font-medium">{photo.title}</p>
              {photo._album && (
                <p className="text-xs text-cyber-pink mt-1 font-mono">
                  📷 {photo._album} · {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 左箭头 */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="上一张"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* 右箭头 */}
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="下一张"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* 底部缩略图条 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto px-4 py-2">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
              i === index ? "border-cyber-pink shadow-[0_0_12px_rgba(236,72,153,0.5)]" : "border-transparent opacity-50 hover:opacity-80"
            }`}
          >
            <img src={p.src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ---- 单张照片（瀑布流卡片） ---- */
function PhotoCard({
  photo,
  index,
  onClick,
}: {
  photo: { id: string; src: string; title: string; _album?: string };
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: [0.32, 0.72, 0, 1] }}
      className="group relative block mb-3 sm:mb-4 break-inside-avoid rounded-xl overflow-hidden border border-cyber-pink/15 bg-cyber-dark/60 hover:border-cyber-pink/50 transition-all duration-300 hover:shadow-[0_0_28px_rgba(236,72,153,0.25)] cursor-pointer text-left"
    >
      {/* 图片：保持原始比例 */}
      <img
        src={photo.src}
        alt={photo.title}
        className="w-full h-auto block object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        loading="lazy"
      />

      {/* 渐变遮罩 + 标题浮层 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white font-medium text-xs sm:text-sm truncate">
          {photo.title}
        </p>
        {photo._album && (
          <p className="text-[10px] sm:text-[11px] text-cyber-pink/80 mt-0.5 font-[family-name:var(--font-mono)] truncate">
            📷 {photo._album}
          </p>
        )}
      </div>

      {/* 角标装饰 */}
      <div className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 border border-white/15 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] text-white/70 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyber-pink" />
      </div>

      {/* 放大镜图标提示 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}

/* ---- 主模块：摄影展瀑布流 ---- */
export default function GalleryCarouselModule() {
  const { content } = useContent();
  const albums: GalleryAlbum[] = content.albums;

  if (!albums.length) return null;

  // 收集所有照片，反转顺序使最新上传的排在前面
  const allPhotos = [...albums.flatMap((album) =>
    album.photos.map((p) => ({ ...p, _album: album.name }))
  )].reverse();

  if (!allPhotos.length) return null;

  // 展示最新 8 张
  const displayPhotos = allPhotos.slice(0, 8);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

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

      {/* 摄影展瀑布流：多图同屏，保持原始比例 */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
        {displayPhotos.map((photo, i) => (
          <PhotoCard key={photo.id} photo={photo} index={i} onClick={() => openLightbox(i)} />
        ))}
      </div>

      {/* 底部装饰线 */}
      <div className="mt-3 sm:mt-4 h-[1px] bg-gradient-to-r from-transparent via-cyber-pink/30 to-transparent" />

      {/* Lightbox 弹窗 */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            photos={displayPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
