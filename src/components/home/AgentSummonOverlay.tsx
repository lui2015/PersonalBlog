"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function AgentSummonOverlay({ open }: { open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black/95"
        >
          {/* 背景网格闪动 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0.05, 0.2, 0] }}
            transition={{ duration: 2.6, times: [0, 0.3, 0.5, 0.7, 1] }}
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,240,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* 扩散能量环 */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{
                duration: 1.6,
                delay: i * 0.35,
                ease: "easeOut",
              }}
              className="absolute rounded-full border"
              style={{
                width: 280,
                height: 280,
                borderColor:
                  i % 2 === 0
                    ? "rgba(0,240,255,0.8)"
                    : "rgba(180,120,255,0.8)",
                boxShadow:
                  i % 2 === 0
                    ? "0 0 40px rgba(0,240,255,0.6)"
                    : "0 0 40px rgba(180,120,255,0.6)",
              }}
            />
          ))}

          {/* 中心放射光线 */}
          <motion.div
            initial={{ rotate: 0, opacity: 0 }}
            animate={{ rotate: 360, opacity: [0, 0.6, 0] }}
            transition={{ duration: 2, ease: "linear" }}
            className="absolute w-[600px] h-[600px]"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(0,240,255,0) 0deg, rgba(0,240,255,0.4) 10deg, rgba(0,240,255,0) 20deg, rgba(180,120,255,0) 180deg, rgba(180,120,255,0.4) 190deg, rgba(180,120,255,0) 200deg, rgba(255,110,199,0) 340deg, rgba(255,110,199,0.4) 350deg, rgba(255,110,199,0) 360deg)",
              maskImage:
                "radial-gradient(circle, transparent 30%, black 32%, black 60%, transparent 62%)",
              WebkitMaskImage:
                "radial-gradient(circle, transparent 30%, black 32%, black 60%, transparent 62%)",
            }}
          />

          {/* 核心光球 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.2, 1, 1.1, 1],
              opacity: [0, 1, 1, 1, 0.9],
            }}
            transition={{ duration: 2.6, times: [0, 0.2, 0.5, 0.8, 1] }}
            className="absolute w-40 h-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,240,255,0.6) 35%, rgba(180,120,255,0.2) 70%, transparent 100%)",
              boxShadow: "0 0 80px rgba(0,240,255,0.8)",
            }}
          />

          {/* 文字 */}
          <div className="relative z-10 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
              animate={{ opacity: [0, 1, 1, 1], y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.4, delay: 0.6 }}
              className="font-[family-name:var(--font-orbitron)] text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(180,120,255,0.8)]"
            >
              鲁力铭
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="mt-4 text-cyber-blue/90 text-sm md:text-base font-[family-name:var(--font-mono)] tracking-[0.3em]"
            >
              智能体已唤醒
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
