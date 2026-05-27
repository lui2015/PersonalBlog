"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

// 滑动切换的最小阈值（像素 / 速度）
const SWIPE_DISTANCE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 300;

export default function PhotoFrameModule() {
  const { content } = useContent();
  const photos = content.photos;
  // direction: 1 = 下一张（向左滑），-1 = 上一张（向右滑）
  const [[current, direction], setCurrent] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (current >= photos.length) setCurrent([0, 0]);
  }, [photos.length, current]);

  if (photos.length === 0) {
    return (
      <div className="cyber-card p-6 hud-corner text-gray-500 text-sm font-[family-name:var(--font-mono)]">
        // 暂无图片
      </div>
    );
  }

  const photo = photos[current] ?? photos[0];
  const total = photos.length;

  const goTo = (next: number, dir: number) => {
    // 包裹索引，支持循环
    const wrapped = ((next % total) + total) % total;
    setCurrent([wrapped, dir]);
  };

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const { offset, velocity } = info;
    if (
      offset.x < -SWIPE_DISTANCE_THRESHOLD ||
      velocity.x < -SWIPE_VELOCITY_THRESHOLD
    ) {
      // 向左滑 → 下一张
      goTo(current + 1, 1);
    } else if (
      offset.x > SWIPE_DISTANCE_THRESHOLD ||
      velocity.x > SWIPE_VELOCITY_THRESHOLD
    ) {
      // 向右滑 → 上一张
      goTo(current - 1, -1);
    }
  };

  // 切换动画：进入方向跟随手势
  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 60 : dir < 0 ? -60 : 0,
      scale: 1.05,
    }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -60 : dir < 0 ? 60 : 0,
      scale: 0.95,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-4 sm:p-6 hud-corner"
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-cyber-purple">
          ◈ PHOTO FRAME
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                aria-label={`切换到第 ${i + 1} 张`}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-cyber-blue shadow-[0_0_5px_var(--color-cyber-blue)]"
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          <Link
            href="/gallery"
            className="text-xs text-cyber-purple/80 hover:text-cyber-purple border border-cyber-purple/40 px-2 py-1 hover:border-cyber-purple hover:shadow-[0_0_10px_rgba(255,46,234,0.35)] transition-all"
          >
            查看更多 →
          </Link>
        </div>
      </div>

      <div
        className="relative aspect-[3/2] overflow-hidden rounded hologram touch-pan-y select-none"
        role="region"
        aria-roledescription="carousel"
        aria-label="照片轮播"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.title}
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 scanlines pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cyber-black/90 to-transparent pointer-events-none">
              <p className="text-cyber-blue text-sm font-medium">{photo.title}</p>
              <p className="text-gray-400 text-xs">{photo.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
