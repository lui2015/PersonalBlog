"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Platform {
  name: string;
  icon: string;
  desc: string;
  qr: string; // public/ 下的相对路径
  color: string;
}

const PLATFORMS: Platform[] = [
  {
    name: "微信公众号",
    icon: "💬",
    desc: "关注获取最新动态",
    qr: "/images/qrcode-wechat.png",
    color: "#07c160",
  },
  {
    name: "抖音",
    icon: "🎵",
    desc: "短视频 / 生活记录",
    qr: "/images/qrcode-douyin.png",
    color: "#fe2c55",
  },
  {
    name: "微信视频号",
    icon: "📹",
    desc: "视频内容分享",
    qr: "/images/qrcode-channels.png",
    color: "#07c160",
  },
];

export default function SocialMediaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-cyber-black/85 backdrop-blur-md" />

          {/* Modal 内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-cyber-dark border border-cyber-border rounded-lg p-6 sm:p-8 shadow-[0_0_40px_rgba(0,240,255,0.15)]"
          >
            {/* 标题 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-orbitron)] text-xl sm:text-2xl text-cyber-blue">
                📱 我的自媒体
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* 平台卡片网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border border-cyber-border/50 hover:border-opacity-100 transition-all group"
                  style={{ borderColor: `${p.color}40` }}
                >
                  {/* 图标 + 名称 */}
                  <span className="text-3xl">{p.icon}</span>
                  <h3
                    className="font-[family-name:var(--font-mono)] text-sm font-bold"
                    style={{ color: p.color }}
                  >
                    {p.name}
                  </h3>

                  {/* 二维码 */}
                  <div className="relative w-36 h-36 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.qr}
                      alt={`${p.name} 二维码`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // 图片不存在时显示占位
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const placeholder = document.createElement("div");
                        placeholder.className =
                          "text-xs text-gray-400 text-center p-2 font-[family-name:var(--font-mono)]";
                        placeholder.textContent = "二维码待上传";
                        target.parentElement?.appendChild(placeholder);
                      }}
                    />
                  </div>

                  {/* 描述 */}
                  <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)]">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* 底部提示 */}
            <p className="mt-6 text-center text-xs text-gray-600 font-[family-name:var(--font-mono)]">
              扫码关注 · 更多精彩内容持续更新中
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
