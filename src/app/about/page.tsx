"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

const timeline = [
  { year: "2015", title: "计算机本科毕业", desc: "桂林电子科技大学 · 计算机科学与技术" },
  { year: "2016", title: "安卓开发工程师", desc: "亚信科技，开启研发生涯（4 年技术沉淀）" },
  { year: "2019", title: "转型项目管理", desc: "飞笛科技 · 软件组长 / 项目经理" },
  { year: "2020", title: "MBA 深造", desc: "深圳大学 · 工商管理硕士" },
  { year: "2022", title: "高级互联网项目经理", desc: "OPPO · 主导应用生态持续交付体系" },
  { year: "2025", title: "高级项目经理", desc: "腾讯科技 · CSIG 研发效能提升" },
];

const socialLinks = [
  { name: "GitHub", url: "https://github.com", icon: "⟨/⟩" },
  { name: "Bilibili", url: "https://space.bilibili.com/675642138?spm_id_from=333.337.0.0", icon: "▶" },
  { name: "微博", url: "https://weibo.com", icon: "W" },
  { name: "Email", url: "mailto:635003514@qq.com", icon: "✉" },
];

export default function AboutPage() {
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
                <img
                  src="/images/avatar.jpg"
                  alt="鲁力铭"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 发光环 */}
              <div className="absolute inset-0 hexagon border-2 border-cyber-blue/50 animate-pulse" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-[family-name:var(--font-orbitron)] text-2xl text-cyber-blue mb-2">
                鲁力铭
              </h2>
              <p className="text-cyber-purple text-sm mb-4 font-[family-name:var(--font-mono)]">
                互联网高级项目经理
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                本人拥有 11 年工作经验（4 年研发 + 7 年项目管理），工作积极主动、责任心强，
                善于学习与反思，享受团队共同奋斗的感觉。一个热爱科技、拥抱变化的人，
                专注于用项目管理的专业能力驱动团队高效交付价值。在这里，我分享项目管理心得、
                效能提升实践与一些生活感悟。
              </p>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
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
            {[
              "PMP", "ACP", "NPDP", "PBA",
              "敏捷管理", "OKR", "持续交付", "需求管理",
              "跨团队协作", "效能度量", "数据分析", "产品原型",
            ].map((skill, i) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="cyber-card px-4 py-3 text-center text-sm text-gray-300 hover:text-cyber-blue hover:border-cyber-blue/50 transition-all cursor-default"
              >
                {skill}
              </motion.div>
            ))}
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
                  key={item.year}
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
