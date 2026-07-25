"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

const APP_NAME = "鲁力铭 App";
const APK_URL = "/app-debug.apk";
const DOWNLOAD_PAGE_URL = "https://www.luliming.xyz/download";

export default function DownloadPage() {
  const [copied, setCopied] = useState(false);

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
              href={APK_URL}
              download="app-debug.apk"
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
                (6.1 MB)
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
      </div>
    </div>
  );
}
