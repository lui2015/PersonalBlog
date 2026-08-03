"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

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
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭"
        className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 border border-white/30 flex items-center justify-center text-white hover:text-white transition-all cursor-pointer shadow-lg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute inset-0 z-[25] cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[85vh] mx-4 flex items-center z-[28]" onClick={(e) => e.stopPropagation()}>
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
            <div className="mt-4 text-center">
              <p className="text-white font-medium">{photo.title}</p>
              {photo._album && (
                <p className="text-xs text-cyber-blue mt-1 font-mono">
                  📷 {photo._album} · {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); go(-1); }}
        aria-label="上一张"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[30] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); go(1); }}
        aria-label="下一张"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[30] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </motion.div>
  );
}

/* ---- 主模块：生活照画框 ---- */
export default function PhotoFrameModule() {
  const { content } = useContent();
  const albums = content.albums;

  // 只取 "AboutMe" 相册照片
  const aboutMeAlbum = albums.find((a) => a.name === "AboutMe");
  const allPhotos = aboutMeAlbum
    ? [...aboutMeAlbum.photos.map((p) => ({ ...p, _album: "AboutMe" }))].reverse().slice(0, 8)
    : [];

  // 自动轮播：每 6 秒切换主图
  const [mainIndex, setMainIndex] = useState(0);
  useEffect(() => {
    if (allPhotos.length <= 1) return;
    const timer = setInterval(() => {
      setMainIndex((prev) => (prev + 1) % allPhotos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [allPhotos.length]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!allPhotos.length) return null;

  const mainPhoto = allPhotos[mainIndex];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-4 sm:p-6 hud-corner flex flex-col min-h-[320px]"
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-cyber-purple">
          ◈ PHOTO FRAME
        </h3>
        <Link
          href="/gallery"
          className="text-xs text-gray-500 hover:text-cyber-purple border border-cyber-border px-2 py-1 hover:border-cyber-purple/40 transition-all"
        >
          查看全部 →
        </Link>
      </div>

      {/* 画框区域 */}
      <div className="flex-1 relative overflow-hidden rounded-lg">
        {/* 相框内边框装饰 */}
        <div className="absolute inset-0 pointer-events-none z-10 border-[3px] border-white/[0.06] rounded-lg m-1" />
        <div className="absolute inset-0 pointer-events-none z-10 border border-cyber-purple/15 rounded-lg m-2" />

        {/* 主图（带切换动画） */}
        <AnimatePresence mode="wait">
          <motion.button
            key={mainPhoto.id}
            onClick={() => { setLightboxIndex(mainIndex); setLightboxOpen(true); }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full h-full absolute inset-0 cursor-pointer group"
          >
            <img
              src={mainPhoto.src}
              alt={mainPhoto.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover 遮罩 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-end p-3">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs sm:text-sm truncate">{mainPhoto.title}</p>
                {mainPhoto._album && (
                  <p className="text-[10px] text-cyber-purple/80 mt-0.5">📷 {mainPhoto._album}</p>
                )}
              </div>
            </div>
            {/* 放大图标 */}
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </motion.button>
        </AnimatePresence>
      </div>

      {/* 底部缩略图条 */}
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {allPhotos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setMainIndex(i)}
            className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
              i === mainIndex
                ? "border-cyber-purple shadow-[0_0_10px_rgba(168,85,247,0.35)]"
                : "border-transparent opacity-50 hover:opacity-80 hover:border-white/20"
            }`}
          >
            <img src={p.src} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {/* 底部装饰线 */}
      <div className="mt-2 h-[1px] bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent" />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            photos={allPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
