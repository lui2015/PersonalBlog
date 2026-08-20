"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import { useAuth } from "@/lib/AuthContext";
import type { GalleryAlbum } from "@/lib/types";
import CyberButton from "@/components/ui/CyberButton";
import AlbumEditorModal from "@/components/admin/AlbumEditorModal";
import { btnPrimary } from "@/components/admin/AdminPanel";

export default function GalleryPage() {
  const { content, ready, updateSection } = useContent();
  const { authed } = useAuth();
  const albums = content.albums;

  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const sortedAlbums = [...albums].sort((a, b) =>
    sortOrder === "desc" ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)
  );

  const handleSaveAlbum = (album: GalleryAlbum) => {
    const exists = albums.some((a) => a.id === album.id);
    const next = exists
      ? albums.map((a) => (a.id === album.id ? album : a))
      : [album, ...albums];
    updateSection("albums", next);
    setAlbumModalOpen(false);
  };

  const handleDeleteAlbum = (id: string) => {
    if (!confirm("确定删除该相册吗？相册内的照片也会一并删除。")) return;
    updateSection(
      "albums",
      albums.filter((a) => a.id !== id)
    );
  };

  const currentAlbum = selectedAlbum
    ? albums.find((a) => a.id === selectedAlbum.id) ?? selectedAlbum
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <header className="mb-10 text-center">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.3em] text-cyber-pink">
            GALLERY
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-orbitron)] text-4xl text-cyber-blue sm:text-5xl">
            摄影作品
          </h1>
          <p className="mt-3 text-gray-400">定格光影瞬间</p>
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
              <span className="text-xs text-gray-500 hidden sm:inline">管理员模式：可直接添加 / 编辑 / 删除相册</span>
              <button
                className={btnPrimary}
                onClick={() => {
                  setEditingAlbum(null);
                  setAlbumModalOpen(true);
                }}
              >
                + 新增相册
              </button>
            </div>
          )}
        </div>

        {!ready ? (
          <div className="py-20 text-center text-gray-500">加载中…</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAlbums.map((album) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative cursor-pointer"
                onClick={() => setSelectedAlbum(album)}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-cyber-border bg-cyber-black/50 transition-all group-hover:border-cyber-blue group-hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {authed && (
                    <div
                      className="absolute right-2 top-2 z-20 flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          setEditingAlbum(album);
                          setAlbumModalOpen(true);
                        }}
                        className="rounded bg-cyber-black/80 px-2 py-1 text-xs text-cyber-blue transition-colors hover:bg-cyber-blue hover:text-cyber-black"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="rounded bg-cyber-black/80 px-2 py-1 text-xs text-cyber-pink transition-colors hover:bg-cyber-pink hover:text-cyber-black"
                      >
                        删除
                      </button>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-[family-name:var(--font-orbitron)] text-xl text-cyber-blue">
                      {album.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">{album.count} 张照片</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <CyberButton href="/">返回首页</CyberButton>
        </div>
      </div>

      {/* 相册详情 */}
      <AnimatePresence>
        {currentAlbum && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/95 p-4 sm:p-8"
            onClick={() => setSelectedAlbum(null)}
          >
            <div className="mx-auto max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-[family-name:var(--font-orbitron)] text-2xl text-cyber-blue">
                    {currentAlbum.name}
                  </h2>
                  <p className="text-sm text-gray-400">{currentAlbum.count} 张照片</p>
                </div>
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="text-gray-400 transition-colors hover:text-cyber-pink"
                >
                  ✕ 关闭
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {currentAlbum.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group cursor-pointer overflow-hidden rounded-lg border border-cyber-border"
                    onClick={() => setLightboxImage(photo.src)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="truncate px-2 py-1 text-xs text-gray-400">{photo.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 灯箱 */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightboxImage(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImage} alt="" className="max-h-[90vh] max-w-full rounded-lg" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute right-6 top-6 text-gray-300 transition-colors hover:text-cyber-pink"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AlbumEditorModal
        open={albumModalOpen}
        initial={editingAlbum}
        onClose={() => setAlbumModalOpen(false)}
        onSave={handleSaveAlbum}
      />
    </main>
  );
}
