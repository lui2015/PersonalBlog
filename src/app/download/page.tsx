"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/lib/AuthContext";
import { formatApkSize, useApk } from "@/lib/useApk";

const APP_NAME = "鲁力铭 App";
const DOWNLOAD_PAGE_URL = "https://www.luliming.xyz/download";

export default function DownloadPage() {
  const [copied, setCopied] = useState(false);
  const { authed } = useAuth();
  const { meta, upload } = useApk();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const apkInputRef = useRef<HTMLInputElement>(null);

  const apkUrl = meta?.url ?? "/app-debug.apk";
  const sizeText =
    meta?.exists && meta.size ? `(${formatApkSize(meta.size)})` : "(6.1 MB)";

  const handleApkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    const result = await upload(file);
    setUploading(false);
    setUploadMsg(
      result.ok
        ? "✓ APK 已更新，下载链接即时生效"
        : `上传失败：${result.error || "未知错误"}`
    );
    if (apkInputRef.current) apkInputRef.current.value = "";
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(DOWNLOAD_PAGE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback: no-op */
    }
  };

  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl text-cyber-blue glitch mb-4"
            data-text="DOWNLOAD"
          >
            DOWNLOAD
          </h1>
          <p className="text-gray-500">// 扫码或点击下载 {APP_NAME}</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="cyber-card p-8 md:p-12"
        >
          <div className="flex flex-col items-center gap-8">
            {/* QR Code Section */}
            <div className="relative group">
              <div className="p-6 bg-white rounded-xl border-2 border-cyber-border group-hover:border-cyber-blue transition-colors duration-300">
                <QRCodeSVG
                  value={DOWNLOAD_PAGE_URL}
                  size={220}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                />
              </div>
              {/* Scan hint overlay */}
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
              href={apkUrl}
              download="luliming-app.apk"
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-transparent border-2 border-cyber-purple text-cyber-purple font-[family-name:var(--font-orbitron)] text-lg tracking-wider overflow-hidden transition-all duration-300 hover:bg-cyber-purple hover:text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-95"
            >
              {/* Animated background sweep */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>直接下载 APK</span>
              <span className="text-xs font-[family-name:var(--font-mono)] opacity-60 ml-1">
                {sizeText}
              </span>
            </a>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="text-sm text-gray-500 hover:text-cyber-blue transition-colors font-[family-name:var(--font-mono)] flex items-center gap-2"
            >
              {copied ? (
                <>
                  <span className="text-green-400">✓</span> 已复制链接
                </>
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
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-3 text-sm text-gray-500 font-[family-name:var(--font-mono)]"
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

        {/* Admin: APK 上传替换 */}
        {authed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 border-2 border-dashed border-cyber-purple/40 p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-orbitron)] text-sm text-cyber-purple mb-1">
                  ◈ 管理员操作 · 更新 APK
                </h3>
                <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
                  {meta?.exists
                    ? `当前已上传新包：${formatApkSize(meta.size)}${
                        meta.updatedAt
                          ? ` · ${new Date(meta.updatedAt).toLocaleString()}`
                          : ""
                      }`
                    : "当前使用内置安装包（public/app-debug.apk），上传后将自动替换"}
                </p>
              </div>
              <button
                onClick={() => apkInputRef.current?.click()}
                disabled={uploading}
                className="shrink-0 px-6 py-2.5 border-2 border-cyber-purple text-cyber-purple text-sm font-[family-name:var(--font-mono)] tracking-wider transition-all duration-300 hover:bg-cyber-purple hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "上传中..." : meta?.exists ? "替换 APK" : "上传 APK"}
              </button>
              <input
                ref={apkInputRef}
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={handleApkUpload}
                className="hidden"
              />
            </div>
            {uploadMsg && (
              <p
                className={`mt-3 text-xs font-[family-name:var(--font-mono)] ${
                  uploadMsg.startsWith("✓") ? "text-green-400" : "text-red-400"
                }`}
              >
                {uploadMsg}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
