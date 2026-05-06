"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-5xl md:text-7xl lg:text-8xl font-bold text-cyber-blue glitch mb-4"
            data-text="CYBERSPACE"
          >
            CYBERSPACE
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-[family-name:var(--font-rajdhani)] text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
        >
          欢迎来到我的赛博空间 —— 记录代码、创意与生活
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
            探索博客
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
