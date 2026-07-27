"use client";

import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import type { GalleryAlbum } from "@/lib/types";

/* ---- 单张照片（瀑布流卡片） ---- */
function PhotoCard({
  photo,
  index,
}: {
  photo: { id: string; src: string; title: string; _album?: string };
  index: number;
}) {
  return (
    <motion.a
      href="/gallery"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: [0.32, 0.72, 0, 1] }}
      className="group relative block mb-3 sm:mb-4 break-inside-avoid rounded-xl overflow-hidden border border-cyber-pink/15 bg-cyber-dark/60 hover:border-cyber-pink/50 transition-all duration-300 hover:shadow-[0_0_28px_rgba(236,72,153,0.25)] cursor-pointer"
    >
      {/* 图片：保持原始比例，绝不拉伸 */}
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
    </motion.a>
  );
}

/* ---- 主模块：摄影展瀑布流 ---- */
export default function GalleryCarouselModule() {
  const { content } = useContent();
  const albums: GalleryAlbum[] = content.albums;

  if (!albums.length) return null;

  // 收集所有相册的照片，最多展示 8 张
  const allPhotos = albums.flatMap((album) =>
    album.photos.map((p) => ({ ...p, _album: album.name }))
  );
  if (!allPhotos.length) return null;

  const displayPhotos = allPhotos.slice(0, 8);

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
          <PhotoCard key={photo.id} photo={photo} index={i} />
        ))}
      </div>

      {/* 底部装饰线 */}
      <div className="mt-3 sm:mt-4 h-[1px] bg-gradient-to-r from-transparent via-cyber-pink/30 to-transparent" />
    </section>
  );
}
