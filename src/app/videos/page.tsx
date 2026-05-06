"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const categories = ["全部", "Vlog", "教程", "创意"];

const videos = [
  {
    id: "1",
    title: "赛博朋克 UI 动画教程",
    category: "教程",
    duration: "12:34",
    cover: "https://picsum.photos/seed/vid1/640/360",
    views: 2340,
    date: "2026-04-28",
  },
  {
    id: "2",
    title: "我的开发工作台 Setup Tour",
    category: "Vlog",
    duration: "8:21",
    cover: "https://picsum.photos/seed/vid2/640/360",
    views: 5620,
    date: "2026-04-20",
  },
  {
    id: "3",
    title: "Three.js 3D 粒子效果实战",
    category: "教程",
    duration: "18:45",
    cover: "https://picsum.photos/seed/vid3/640/360",
    views: 3100,
    date: "2026-04-15",
  },
  {
    id: "4",
    title: "代码生成艺术 - 流体模拟",
    category: "创意",
    duration: "5:10",
    cover: "https://picsum.photos/seed/vid4/640/360",
    views: 8900,
    date: "2026-04-08",
  },
  {
    id: "5",
    title: "一周的远程工作日常",
    category: "Vlog",
    duration: "15:22",
    cover: "https://picsum.photos/seed/vid5/640/360",
    views: 4200,
    date: "2026-03-30",
  },
  {
    id: "6",
    title: "从零搭建个人博客全流程",
    category: "教程",
    duration: "25:11",
    cover: "https://picsum.photos/seed/vid6/640/360",
    views: 7600,
    date: "2026-03-22",
  },
];

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredVideos = videos.filter(
    (v) => activeCategory === "全部" || v.category === activeCategory
  );

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
            data-text="VIDEOS"
          >
            VIDEOS
          </h1>
          <p className="text-gray-500">// 视频创作与教程分享</p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs border transition-all duration-300 ${
                activeCategory === cat
                  ? "border-cyber-blue text-cyber-blue shadow-[0_0_5px_var(--color-cyber-blue)]"
                  : "border-cyber-border text-gray-500 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="cyber-card overflow-hidden group cursor-pointer"
              onClick={() => setPlayingId(video.id)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.cover}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 scanlines opacity-30" />
                <div className="absolute inset-0 bg-cyber-black/30 group-hover:bg-cyber-black/10 transition-colors" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-cyber-blue/80 flex items-center justify-center bg-cyber-black/50 group-hover:scale-110 group-hover:shadow-[0_0_20px_var(--color-cyber-blue)] transition-all">
                    <span className="text-cyber-blue text-xl ml-1">▶</span>
                  </div>
                </div>

                {/* Duration */}
                <span className="absolute bottom-2 right-2 text-[10px] bg-cyber-black/80 px-1.5 py-0.5 text-gray-300 font-[family-name:var(--font-mono)]">
                  {video.duration}
                </span>

                {/* Category Badge */}
                <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 bg-cyber-purple/80 text-white">
                  {video.category}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-200 group-hover:text-cyber-blue transition-colors line-clamp-2 mb-2">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
                  <span>{video.views.toLocaleString()} 次观看</span>
                  <span>{video.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Player Modal */}
        {playingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/95 backdrop-blur-sm"
            onClick={() => setPlayingId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-4xl mx-4 aspect-video cyber-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HUD Frame */}
              <div className="absolute inset-0 border-2 border-cyber-blue/30 z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyber-blue" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-blue" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyber-blue" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyber-blue" />
              </div>

              <div className="w-full h-full flex items-center justify-center bg-cyber-dark">
                <div className="text-center">
                  <p className="text-cyber-blue font-[family-name:var(--font-orbitron)] text-lg mb-2">
                    {videos.find((v) => v.id === playingId)?.title}
                  </p>
                  <p className="text-gray-500 text-sm font-[family-name:var(--font-mono)]">
                    // 视频播放器占位 - 可嵌入 B站/YouTube iframe
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setPlayingId(null)}
                className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center border border-cyber-border text-gray-400 hover:text-cyber-pink hover:border-cyber-pink transition-all"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
