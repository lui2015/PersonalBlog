"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import WorksCategoryModal from "@/components/home/WorksCategoryModal";
import { lazy, Suspense } from "react";

const FireworksCanvas = lazy(() => import("@/components/home/FireworksCanvas"));
const StarfieldCanvas = lazy(() => import("@/components/home/StarfieldCanvas"));
const BubblesCanvas = lazy(() => import("@/components/home/BubblesCanvas"));
const MatrixRainCanvas = lazy(() => import("@/components/home/MatrixRainCanvas"));
const EnergyRingsCanvas = lazy(() => import("@/components/home/EnergyRingsCanvas"));

function BgCanvas({ mode }: { mode: string }) {
  return (
    <Suspense fallback={null}>
      {mode === "fireworks" ? (
        <FireworksCanvas />
      ) : mode === "stars" ? (
        <StarfieldCanvas />
      ) : mode === "bubbles" ? (
        <BubblesCanvas />
      ) : mode === "matrix" ? (
        <MatrixRainCanvas />
      ) : (
        <EnergyRingsCanvas />
      )}
    </Suspense>
  );
}
import AgentModal from "@/components/home/AgentModal";
import AgentSummonOverlay from "@/components/home/AgentSummonOverlay";

/** 静态兜底：首屏立即显示，不等 API */
const FALLBACK_HERO = {
  title: "鲁力铭",
  subtitle: "全栈开发者 / 投资爱好者 / 终身学习者",
  avatarText: "鲁",
  avatarUrl: "",
};

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i * (360 / 16) * Math.PI) / 180;
  const dist = 90 + (i % 3) * 22;
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
});

export default function HeroSection() {
  const { content, ready } = useContent();
  const serverHero = content.hero;

  // 首次渲染用静态兜底立即显示；API 就绪后切换到真实数据（含头像）
  const [displayedHero, setDisplayedHero] = useState(FALLBACK_HERO);
  useEffect(() => {
    if (ready && serverHero) {
      setDisplayedHero(serverHero);
    }
  }, [ready, serverHero]);

  const { title, subtitle, avatarText, avatarUrl } = displayedHero;
  const [burstKey, setBurstKey] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [worksOpen, setWorksOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [summoning, setSummoning] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [hint, setHint] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bgMode, setBgMode] = useState<
    "fireworks" | "stars" | "bubbles" | "matrix" | "rings"
  >("fireworks");

  const triggerBurst = () => {
    setBurstKey((k) => k + 1);
    setPulse(true);
    setTimeout(() => setPulse(false), 500);
    // 点击头像切换背景：烟花 -> 星空 -> 梦幻泡泡 -> 矩阵雨 -> 能量环 -> 烟花
    setBgMode((m) =>
      m === "fireworks"
        ? "stars"
        : m === "stars"
          ? "bubbles"
          : m === "bubbles"
            ? "matrix"
            : m === "matrix"
              ? "rings"
              : "fireworks"
    );

    // 连续点击 5 次召唤「鲁力铭」对话智能体
    const n = clickCountRef.current + 1;
    clickCountRef.current = n;
    setClickCount(n);
    setHint(true);
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
      setClickCount(0);
      setHint(false);
    }, 2500);

    if (n >= 5) {
      // 满 5 次：触发全屏召唤动效，结束后弹出智能体
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;
      setClickCount(0);
      setHint(false);
      setSummoning(true);
      setTimeout(() => {
        setSummoning(false);
        setAgentOpen(true);
      }, 2600);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
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

      <BgCanvas mode={bgMode} />

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
          className="flex justify-center mb-8"
        >
          <motion.button
            type="button"
            onClick={triggerBurst}
            whileHover={{ scale: 1.05 }}
            animate={{ scale: pulse ? 0.9 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="relative cursor-pointer outline-none"
            title="点击头像：触发能量迸发 + 切换背景（烟花/星空/梦幻泡泡/矩阵雨/能量环）"
            aria-label="点击头像触发特效"
          >
            {hint && (
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-[11px] text-cyber-pink/80 font-[family-name:var(--font-mono)] whitespace-nowrap pointer-events-none">
                连续点击 {5 - clickCount} 次召唤智能体…
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyber-blue via-cyber-purple to-cyber-pink blur-xl opacity-60 animate-pulse" />
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
                <div className="absolute inset-0 scanlines pointer-events-none" />
                <motion.div
                  initial={false}
                  animate={{ opacity: pulse ? 0.7 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-cyber-blue/40 mix-blend-screen"
                />
              </div>
              <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyber-blue" />
              <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyber-blue" />
              <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyber-blue" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyber-blue" />

              {burstKey > 0 && (
                <div
                  key={burstKey}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 1, opacity: 0.85 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 1.1, delay, ease: "easeOut" }}
                      className={`absolute w-32 h-32 md:w-40 md:h-40 rounded-full border-2 ${
                        i % 2 === 0 ? "border-cyber-blue" : "border-cyber-pink"
                      }`}
                    />
                  ))}
                  {PARTICLES.map((p, i) => (
                    <motion.span
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="absolute w-1.5 h-1.5 rounded-full bg-cyber-pink shadow-[0_0_8px_var(--color-cyber-pink)]"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-cyber-blue glitch mb-4 break-words"
            data-text={title}
          >
            {title}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-[family-name:var(--font-rajdhani)] text-base sm:text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto px-2"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button
            type="button"
            onClick={() => setWorksOpen(true)}
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-cyber-blue text-cyber-blue font-[family-name:var(--font-orbitron)] text-xs sm:text-sm hover:bg-cyber-blue/10 hover:shadow-[0_0_20px_var(--color-cyber-blue)] transition-all duration-300"
          >
            探索我的作品
          </button>
          <a
            href="/about"
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-cyber-purple text-cyber-purple font-[family-name:var(--font-orbitron)] text-xs sm:text-sm hover:bg-cyber-purple/10 hover:shadow-[0_0_20px_var(--color-cyber-purple)] transition-all duration-300"
          >
            了解更多
          </a>
        </motion.div>

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

      <WorksCategoryModal open={worksOpen} onClose={() => setWorksOpen(false)} />
      <AgentModal open={agentOpen} onClose={() => setAgentOpen(false)} />
      <AgentSummonOverlay open={summoning} />
    </section>
  );
}
