"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/lib/AuthContext";
import { useContent } from "@/lib/ContentContext";
import { DEFAULT_CONTENT } from "@/lib/defaultContent";
import { normalizeSkillTree } from "@/lib/aboutContent";
import AboutEditor from "@/components/about/AboutEditor";
import EditorModal from "@/components/admin/EditorModal";
import { btnPrimary, btnGhost } from "@/components/admin/AdminPanel";
import type { AboutContent } from "@/lib/types";

export default function AboutPage() {
  const { authed } = useAuth();
  const { content, updateSection, flush, saveStatus } = useContent();
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<AboutContent | null>(null);
  const [certPreview, setCertPreview] = useState<{ name: string; url: string } | null>(null);

  const about = content.about ?? DEFAULT_CONTENT.about;
  const timeline = about.timeline ?? [];
  const socialLinks = about.socialLinks ?? [];
  const skillTree = normalizeSkillTree(about.skillTree);

  useEffect(() => {
    if (!certPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCertPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [certPreview]);

  const openEditor = () => {
    setDraft(structuredClone(about));
    setEditorOpen(true);
  };
  const handleSave = async () => {
    if (!draft) return;
    updateSection("about", draft);
    await flush();
    setEditorOpen(false);
    setDraft(null);
  };

  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl text-cyber-blue glitch mb-4"
            data-text="ABOUT ME"
          >
            ABOUT ME
          </h1>
          <p className="text-gray-500">// 了解更多关于我的信息</p>
        </motion.div>

        {/* 管理员编辑入口 */}
        {authed && (
          <div className="flex justify-end items-center gap-3 mb-4">
            {saveStatus === "saved" && (
              <span className="text-[11px] text-cyber-green font-[family-name:var(--font-mono)]">
                ✓ 已保存
              </span>
            )}
            <button onClick={openEditor} className={btnPrimary}>
              ✏️ 编辑「关于我」
            </button>
          </div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-card p-8 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="hexagon w-40 h-40 overflow-hidden hologram">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={about?.avatar || "/images/avatar.jpg"}
                  alt={about?.name || "头像"}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 发光环 */}
              <div className="absolute inset-0 hexagon border-2 border-cyber-blue/50 animate-pulse" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-[family-name:var(--font-orbitron)] text-2xl text-cyber-blue mb-2">
                {about?.name}
              </h2>
              <p className="text-cyber-purple text-sm mb-4 font-[family-name:var(--font-mono)]">
                {about?.role}
              </p>
              <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
                {about?.bio}
              </p>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center border border-cyber-border text-gray-400 hover:text-cyber-blue hover:border-cyber-blue hover:shadow-[0_0_10px_var(--color-cyber-blue)] transition-all duration-300 rounded"
                    title={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-purple mb-6 text-center">
            ◈ SKILL TREE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {skillTree.map((skill, i) => {
              const hasCert = Boolean(skill.certificate);
              return (
                <motion.button
                  key={skill.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() =>
                    hasCert &&
                    setCertPreview({ name: skill.name, url: skill.certificate })
                  }
                  title={hasCert ? "点击查看证书" : undefined}
                  className={`cyber-card w-full px-4 py-3 text-center text-sm text-gray-300 hover:text-cyber-blue hover:border-cyber-blue/50 transition-all ${
                    hasCert ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    {hasCert && <span className="text-xs">📜</span>}
                    {skill.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-green mb-8 text-center">
            ◈ TIMELINE
          </h3>
          <div className="relative">
            {/* 中轴线 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-blue via-cyber-purple to-cyber-pink" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 ${
                    i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      i % 2 === 0 ? "text-right" : "text-left"
                    }`}
                  >
                    <div className="cyber-card p-4 inline-block">
                      <span className="font-[family-name:var(--font-orbitron)] text-xs text-cyber-blue">
                        {item.year}
                      </span>
                      <h4 className="text-sm font-medium text-gray-200 mt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>

                  {/* 节点 */}
                  <div className="w-3 h-3 bg-cyber-blue rounded-full shadow-[0_0_10px_var(--color-cyber-blue)] z-10" />

                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* App Download */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-pink mb-8 text-center">
            ◈ APP DOWNLOAD
          </h3>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="cyber-card p-8 md:p-12 max-w-2xl mx-auto"
          >
            <div className="flex flex-col items-center gap-8">
              {/* QR Code */}
              <div className="relative group">
                <div className="p-6 bg-white rounded-xl border-2 border-cyber-border group-hover:border-cyber-blue transition-colors duration-300">
                  <QRCodeSVG
                    value="https://www.luliming.xyz/download"
                    size={220}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#0a0a0a"
                  />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyber-black border border-cyber-blue/50 rounded-full">
                  <span className="text-xs font-[family-name:var(--font-mono)] text-cyber-blue">
                    手机扫码下载
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyber-border to-transparent" />
                <span className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">OR</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyber-border to-transparent" />
              </div>

              {/* Direct Download Button */}
              <a
                href="/app-debug.apk"
                download="app-debug.apk"
                className="group relative inline-flex items-center gap-3 px-10 py-4 bg-transparent border-2 border-cyber-purple text-cyber-purple font-[family-name:var(--font-orbitron)] text-lg tracking-wider overflow-hidden transition-all duration-300 hover:bg-cyber-purple hover:text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>直接下载 APK</span>
                <span className="text-xs font-[family-name:var(--font-mono)] opacity-60 ml-1">(6.1 MB)</span>
              </a>

              {/* Copy Link */}
              <DownloadCopyLink />
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 space-y-3 text-sm text-gray-500 font-[family-name:var(--font-mono)] max-w-2xl mx-auto"
          >
            <p className="flex items-start gap-2">
              <span className="text-cyber-blue mt-0.5">▸</span>
              <span>Android 设备：扫描二维码后自动跳转下载页面</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-cyber-blue mt-0.5">▸</span>
              <span>电脑端：点击上方按钮直接下载 APK 安装包</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-cyber-blue mt-0.5">▸</span>
              <span>安装时请在系统设置中允许「未知来源」应用</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* 编辑弹窗 */}
      <EditorModal
        open={editorOpen}
        title="编辑「关于我」"
        onClose={() => setEditorOpen(false)}
        maxWidth="max-w-4xl"
        footer={
          <>
            <button onClick={() => setEditorOpen(false)} className={btnGhost}>
              取消
            </button>
            <button onClick={handleSave} className={btnPrimary}>
              保存
            </button>
          </>
        }
      >
        {draft && <AboutEditor value={draft} onChange={setDraft} />}
      </EditorModal>

      {/* 证书大图预览 */}
      <AnimatePresence>
        {certPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCertPreview(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-cyber-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl flex flex-col items-center gap-4"
            >
              <p className="text-sm text-cyber-blue font-[family-name:var(--font-mono)]">
                📜 {certPreview.name} · 证书
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={certPreview.url}
                alt={`${certPreview.name} 证书`}
                className="max-h-[75vh] max-w-full object-contain rounded border border-cyber-border bg-white"
              />
              <button
                type="button"
                onClick={() => setCertPreview(null)}
                className={btnGhost}
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 复制下载链接按钮 */
function DownloadCopyLink() {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("https://www.luliming.xyz/download");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* no-op */ }
  };
  return (
    <button
      onClick={handleCopy}
      className="text-sm text-gray-500 hover:text-cyber-blue transition-colors font-[family-name:var(--font-mono)] flex items-center gap-2"
    >
      {copied ? (
        <><span className="text-green-400">✓</span> 已复制链接</>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          复制下载链接
        </>
      )}
    </button>
  );
}
