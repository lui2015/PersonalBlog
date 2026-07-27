"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  hue: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  alpha: number;
  life: number;
}

const STAR_COLORS = ["#ffffff", "#bfefff", "#d8c0ff", "#ffe0f0", "#a0f0ff"];

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingRef = useRef<ShootingStar[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const initStars = () => {
      const count = Math.floor((w * h) / 1400);
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.6 + 0.3,
          baseAlpha: 0.3 + Math.random() * 0.5,
          twinkleSpeed: 0.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          hue: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        });
      }
      starsRef.current = stars;
    };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initStars();
    };
    resize();
    window.addEventListener("resize", resize);

    let lastShoot = Date.now();

    const spawnShootingStar = () => {
      const startX = Math.random() * w * 0.6;
      const startY = Math.random() * h * 0.4;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const speed = 6 + Math.random() * 4;
      shootingRef.current.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 80 + Math.random() * 80,
        alpha: 1,
        life: 1,
      });
    };

    const animate = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // 星星闪烁
      for (const s of starsRef.current) {
        const tw =
          s.baseAlpha +
          Math.sin(t * 0.001 * s.twinkleSpeed + s.phase) * 0.35;
        const alpha = Math.max(0.05, Math.min(1, tw));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.hue;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // 亮星加光晕
        if (s.size > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = s.hue;
          ctx.globalAlpha = alpha * 0.15;
          ctx.fill();
        }
      }

      // 偶尔流星
      const now = Date.now();
      if (now - lastShoot > 2500 + Math.random() * 3000) {
        spawnShootingStar();
        lastShoot = now;
      }

      // 流星更新
      for (let i = shootingRef.current.length - 1; i >= 0; i--) {
        const m = shootingRef.current[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.012;
        m.alpha = Math.max(0, m.life);

        const tailX = m.x - m.vx * (m.len / 6);
        const tailY = m.y - m.vy * (m.len / 6);

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        if (m.life <= 0 || m.x > w || m.y > h) {
          shootingRef.current.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
