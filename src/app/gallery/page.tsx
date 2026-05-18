"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const albums = [
  {
    id: "travel",
    name: "旅行记忆",
    cover: "https://picsum.photos/seed/album1/600/400",
    count: 24,
    photos: Array.from({ length: 8 }, (_, i) => ({
      id: `travel-${i}`,
      src: `https://picsum.photos/seed/travel${i}/800/600`,
      title: `旅行照片 ${i + 1}`,
    })),
  },
  {
    id: "daily",
    name: "日常生活",
    cover: "https://picsum.photos/seed/album2/600/400",
    count: 18,
    photos: Array.from({ length: 6 }, (_, i) => ({
      id: `daily-${i}`,
      src: `https://picsum.photos/seed/daily${i}/800/600`,
      title: `日常照片 ${i + 1}`,
    })),
  },
  {
    id: "photography",
    name: "摄影作品",
    cover: "https://picsum.photos/seed/album3/600/400",
    count: 32,
    photos: Array.from({ length: 9 }, (_, i) => ({
      id: `photo-${i}`,
      src: `https://picsum.photos/seed/photo${i}/800/600`,
      title: `摄影作品 ${i + 1}`,
    })),
  },
  {
    id: "creative",
    name: "创意设计",
    cover: "https://picsum.photos/seed/album4/600/400",
    count: 15,
    photos: Array.from({ length: 6 }, (_, i) => ({
      id: `creative-${i}`,
      src: `https://picsum.photos/seed/creative${i}/800/600`,
      title: `创意作品 ${i + 1}`,
    })),
  },
];

export default function GalleryPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const currentAlbum = albums.find((a) => a.id === selectedAlbum);

  const openLightbox = (index: number) => {
    if (!currentAlbum) return;
    setLightboxIndex(index);
    setLightboxImage(currentAlbum.photos[index].src);
  };

  const navigateLightbox = (direction: number) => {
    if (!currentAlbum) return;
    const newIndex =
      (lightboxIndex + direction + currentAlbum.photos.length) %
      currentAlbum.photos.length;
    setLightboxIndex(newIndex);
    setLightboxImage(currentAlbum.photos[newIndex].src);
  };

  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl text-cyber-blue glitch mb-4"
            data-text="GALLERY"
          >
            GALLERY
          </h1>
          <p className="text-gray-500">// 用镜头记录美好瞬间</p>
        </motion.div>

        {!selectedAlbum ? (
          /* Album Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {albums.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, rotateY: 2 }}
                className="cyber-card overflow-hidden cursor-pointer group"
                style={{ perspective: "1000px" }}
                onClick={() => setSelectedAlbum(album.id)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent" />
                  <div className="absolute inset-0 scanlines opacity-30" />

                  {/* Album Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-blue mb-1">
                      {album.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-[family-name:var(--font-mono)]">
                      {album.count} photos
                    </p>
                  </div>

                  {/* Holographic Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 via-transparent to-cyber-purple/10" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Photo Grid */
          <div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedAlbum(null)}
              className="mb-6 text-sm text-gray-500 hover:text-cyber-blue transition-colors font-[family-name:var(--font-mono)]"
            >
              ← 返回相册
            </motion.button>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-[family-name:var(--font-orbitron)] text-xl text-cyber-purple mb-6"
            >
              {currentAlbum?.name}
            </motion.h2>

            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {currentAlbum?.photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="break-inside-avoid cursor-pointer group"
                  onClick={() => openLightbox(i)}
                >
                  <div className="relative overflow-hidden rounded cyber-card">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 scanlines" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-cyber-black/80 to-transparent">
                        <p className="text-xs text-cyber-blue">{photo.title}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/95 backdrop-blur-sm"
              onClick={() => setLightboxImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-5xl max-h-[90vh] mx-4 touch-pan-y select-none"
                onClick={(e) => e.stopPropagation()}
                drag="x"
                dragSnapToOrigin
                dragElastic={0.2}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  // 触摸滑动 / 鼠标拖拽切图：距离阈值 80px 或速度阈值 500
                  const { offset, velocity } = info;
                  if (offset.x < -80 || velocity.x < -500) {
                    navigateLightbox(1);
                  } else if (offset.x > 80 || velocity.x > 500) {
                    navigateLightbox(-1);
                  }
                }}
              >
                <img
                  src={lightboxImage}
                  alt=""
                  className="max-w-full max-h-[85vh] object-contain rounded pointer-events-none"
                  draggable={false}
                />

                {/* Navigation */}
                <button
                  onClick={() => navigateLightbox(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all"
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateLightbox(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all"
                >
                  ›
                </button>

                {/* Close */}
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-cyber-border text-gray-400 hover:text-cyber-pink hover:border-cyber-pink transition-all"
                >
                  ✕
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-[family-name:var(--font-mono)]">
                  {lightboxIndex + 1} / {currentAlbum?.photos.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
