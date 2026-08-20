"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import { useAuth } from "@/lib/AuthContext";
import type { Video } from "@/lib/types";
import CyberButton from "@/components/ui/CyberButton";
import VideoEditorModal from "@/components/admin/VideoEditorModal";
import { btnPrimary } from "@/components/admin/AdminPanel";

function getEmbed(v: Video): string | null {
  const src = (v.src ?? "").trim();
  if (!src) return null;
  if (src.includes("player.bilibili.com")) return src;
  const bv = src.match(/BV[\w]+/)?.[0];
  if (bv) return `https://player.bilibili.com/player.html?bvid=${bv}&autoplay=1&high_quality=1`;
  return src;
}

export default function VideosPage() {
  const { content, ready, updateSection } = useContent();
  const { authed } = useAuth();
  const videos = content.videos;

  const [lightbox, setLightbox] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const sortedVideos = [...videos].sort((a, b) => {
    const cmp = (b.date || "").localeCompare(a.date || "") || b.id.localeCompare(a.id);
    return sortOrder === "desc" ? cmp : -cmp;
  });

  const handleSaveVideo = (video: Video) => {
    const exists = videos.some((v) => v.id === video.id);
    const next = exists
      ? videos.map((v) => (v.id === video.id ? video : v))
      : [video, ...videos];
    updateSection("videos", next);
    setVideoModalOpen(false);
  };

  const handleDeleteVideo = (id: string) => {
    if (!confirm("确定删除该视频吗？此操作不可撤销。")) return;
    updateSection(
      "videos",
      videos.filter((v) => v.id !== id)
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <header className="mb-10 text-center">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-cyber-pink">
            VIDEOS
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-orbitron)] text-4xl text-cyber-blue sm:text-5xl">
            视频作品
          </h1>
          <p className="mt-3 text-gray-400">用影像记录世界</p>
        </header>

        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
            className="text-xs px-3 py-2 border border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10 transition-all font-[family-name:var(--font-mono)] whitespace-nowrap"
            title={sortOrder === "desc" ? "时间倒序（最新在前）" : "时间正序（最早在前）"}
          >
            {sortOrder === "desc" ? "↓ 最新" : "↑ 最早"}
          </button>
          {authed && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden sm:inline">管理员模式：可直接添加 / 编辑 / 删除视频</span>
              <button
                className={btnPrimary}
                onClick={() => {
                  setEditingVideo(null);
                  setVideoModalOpen(true);
                }}
              >
                + 新增视频
              </button>
            </div>
          )}
        </div>

        {!ready ? (
          <div className="py-20 text-center text-gray-500">加载中…</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedVideos.map((video) => {
              const embed = getEmbed(video);
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-cyber-border bg-cyber-black/50 transition-all group-hover:border-cyber-blue group-hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.cover}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <button
                      onClick={() => {
                        if (!embed) {
                          alert("该视频尚未配置播放地址，点击编辑填写 Bilibili 嵌入地址。");
                          return;
                        }
                        setLightbox(embed);
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label="播放"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyber-blue bg-cyber-black/60 text-cyber-blue shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-transform group-hover:scale-110">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                    <span className="absolute left-3 top-3 rounded bg-cyber-pink/90 px-2 py-0.5 text-xs font-semibold text-cyber-black">
                      {video.category}
                    </span>

                    {authed && (
                      <div className="absolute right-2 top-2 z-20 flex gap-1">
                        <button
                          onClick={() => {
                            setEditingVideo(video);
                            setVideoModalOpen(true);
                          }}
                          className="rounded bg-cyber-black/80 px-2 py-1 text-xs text-cyber-blue transition-colors hover:bg-cyber-blue hover:text-cyber-black"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="rounded bg-cyber-black/80 px-2 py-1 text-xs text-cyber-pink transition-colors hover:bg-cyber-pink hover:text-cyber-black"
                        >
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-blue line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {video.duration} · {video.views} 播放 · {video.date}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <CyberButton href="/">返回首页</CyberButton>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(null)}
          >
            <div
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-10 right-0 text-gray-400 transition-colors hover:text-cyber-pink"
              >
                ✕ 关闭
              </button>
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-cyber-border bg-black">
                <iframe
                  src={lightbox}
                  className="h-full w-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoEditorModal
        open={videoModalOpen}
        initial={editingVideo}
        onClose={() => setVideoModalOpen(false)}
        onSave={handleSaveVideo}
      />
    </main>
  );
}
