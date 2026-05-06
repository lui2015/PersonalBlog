"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

export default function PhotoFrameModule() {
  const { content } = useContent();
  const photos = content.photos;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= photos.length) setCurrent(0);
  }, [photos.length, current]);

  if (photos.length === 0) {
    return (
      <div className="cyber-card p-6 hud-corner text-gray-500 text-sm font-[family-name:var(--font-mono)]">
        // 暂无图片
      </div>
    );
  }

  const photo = photos[current] ?? photos[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-6 hud-corner"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[family-name:var(--font-orbitron)] text-sm text-cyber-purple">
          ◈ PHOTO FRAME
        </h3>
        <div className="flex gap-1">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current
                  ? "bg-cyber-blue shadow-[0_0_5px_var(--color-cyber-blue)]"
                  : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative aspect-[3/2] overflow-hidden rounded hologram">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 scanlines" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cyber-black/90 to-transparent">
              <p className="text-cyber-blue text-sm font-medium">{photo.title}</p>
              <p className="text-gray-400 text-xs">{photo.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
