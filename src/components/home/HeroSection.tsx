"use client";

import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

export default function HeroSection() {
  const { content } = useContent();
  const { title, subtitle, avatarText, avatarUrl } = content.hero;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 text-center px-4">
        {/* 头像展示位 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            {/* 外层光环 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyber-blue via-cyber-purple to-cyber-pink blur-xl opacity-60 animate-pulse" />
            {/* 旋转外框 */}
            <div
              className="absolute -inset-3 rounded-full border border-cyber-blue/40"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, var(--color-cyber-blue), transparent, var(--color-cyber-purple), transparent)",
                WebkitMask:
                  "radial-gradient(circle, transparent 62%, black 63%)",
                mask: "radial-gradient(circle, transparent 62%, black 63%)",
                animation: "spin 6s linear infinite",
              }}
            />
            {/* 头像本体 */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-cyber-blue shadow-[0_0_30px_var(--color-cyber-blue)]">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-dark via-cyber-black to-cyber-dark flex items-center justify-center">
                  <span className="font-[family-name:var(--font-orbitron)] text-3xl md:text-4xl text-cyber-blue neon-text">
                    {avatarText || "?"}
                  </span>
                </div>
              )}
              {/* 扫描线特效 */}
              <div className="absolute inset-0 scanlines pointer-events-none" />
            </div>
            {/* HUD 角标 */}
            <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyber-blue" />
            <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyber-blue" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyber-blue" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyber-blue" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-5xl md:text-7xl lg:text-8xl font-bold text-cyber-blue glitch mb-4"
            data-text={title}
          >
            {title}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-[family-name:var(--font-rajdhani)] text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <a
            href="/blog"
            className="px-6 py-3 border border-cyber-blue text-cyber-blue font-[family-name:var(--font-orbitron)] text-sm hover:bg-cyber-blue/10 hover:shadow-[0_0_20px_var(--color-cyber-blue)] transition-all duration-300"
          >
            探索我的作品
          </a>
          <a
            href="/about"
            className="px-6 py-3 border border-cyber-purple text-cyber-purple font-[family-name:var(--font-orbitron)] text-sm hover:bg-cyber-purple/10 hover:shadow-[0_0_20px_var(--color-cyber-purple)] transition-all duration-300"
          >
            了解更多
          </a>
        </motion.div>

        {/* 下滚提示 */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-cyber-blue/50 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-cyber-blue rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
