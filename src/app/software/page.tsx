"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useContent } from "@/lib/ContentContext";
import { btnPrimary, btnGhost, btnDanger } from "@/components/admin/AdminPanel";
import SoftwareEditorModal from "@/components/admin/SoftwareEditorModal";
import type { SoftwareWork } from "@/lib/types";

export default function SoftwarePage() {
  const { authed } = useAuth();
  const { content, updateSection } = useContent();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<SoftwareWork | null>(null);

  const softwares = content.softwares ?? [];

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (sw: SoftwareWork) => {
    setEditing(sw);
    setEditorOpen(true);
  };
  const handleSave = (sw: SoftwareWork) => {
    const exists = softwares.some((s) => s.id === sw.id);
    const next = exists
      ? softwares.map((s) => (s.id === sw.id ? sw : s))
      : [...softwares, sw];
    updateSection("softwares", next);
    setEditorOpen(false);
  };
  const handleDelete = (id: string) => {
    if (!confirm("确定删除该软件作品？")) return;
    updateSection(
      "softwares",
      softwares.filter((s) => s.id !== id)
    );
    setEditorOpen(false);
  };

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-orbitron)] text-3xl md:text-4xl text-cyber-blue">
              软件作品
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-[family-name:var(--font-mono)]">
              点击卡片即可前往对应项目 / 网页
            </p>
          </div>
          {authed && (
            <button onClick={openNew} className={btnPrimary}>
              + 新增软件作品
            </button>
          )}
        </div>

        {softwares.length === 0 ? (
          <div className="text-center text-gray-600 py-24 font-[family-name:var(--font-mono)]">
            暂无软件作品
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwares.map((sw, i) => (
              <motion.div
                key={sw.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="cyber-card hud-corner group relative overflow-hidden"
              >
                {authed && (
                  <div className="absolute top-2 right-2 z-20 flex gap-2">
                    <button
                      onClick={() => openEdit(sw)}
                      className={btnGhost + " !py-1 !px-2"}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(sw.id)}
                      className={btnDanger + " !py-1 !px-2"}
                    >
                      删除
                    </button>
                  </div>
                )}
                <a
                  href={sw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-cyber-black/40">
                    {sw.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sw.image}
                        alt={sw.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700 font-[family-name:var(--font-mono)] text-xs">
                        NO IMAGE
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-2 right-3 text-cyber-blue text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      ↗
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-[family-name:var(--font-orbitron)] text-base text-cyber-blue mb-2">
                      {sw.name}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                      {sw.description}
                    </p>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <SoftwareEditorModal
        open={editorOpen}
        initial={editing}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </main>
  );
}
