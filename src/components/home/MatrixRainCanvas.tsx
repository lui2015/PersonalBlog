"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: string;
}

const COLORS = ["#00f0ff", "#b478ff", "#ff6ec7", "#78ffdc"];

export default function MatrixRainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const cols = 60; // 列数
    let drops: number[] = [];
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]|;:,.<>?/~`+-=_アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 16;

    // 粒子（光点）
    const particles: Particle[] = [];

    const spawnParticle = (x: number, y: number) => {
      if (particles.length > 80) return;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 0,
        maxLife: 40 + Math.random() * 40,
        size: 1 + Math.random() * 2.5,
        hue: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      drops = Array.from({ length: cols }, () => Math.random() * h / fontSize);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.fillStyle = "rgba(6,6,10,0.12)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols; i++) {
        const x = (i / cols) * w;
        const char = chars[Math.floor(Math.random() * chars.length)];
        const dropY = drops[i] * fontSize;

        // 头部亮字
        ctx.fillStyle = "#fff";
        ctx.fillText(char, x, dropY);

        // 尾迹渐变
        for (let j = 1; j <= 12; j++) {
          const ty = (drops[i] - j) * fontSize;
          if (ty < 0) break;
          const alpha = 1 - j / 14;
          const r = Math.floor(0 + alpha * 0);
          const g = Math.floor(240 * alpha);
          const b = Math.floor(255 * alpha);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.7})`;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, ty);
        }

        drops[i]++;
        if (drops[i] * fontSize > h && Math.random() > 0.96) {
          drops[i] = 0;
          // 到底部时产生粒子爆发
          spawnParticle(x, h);
          spawnParticle(x - 5, h);
          spawnParticle(x + 5, h);
        }
      }

      // 更新粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // 微弱重力
        p.life++;

        const progress = p.life / p.maxLife;
        const alpha = 1 - progress;

        if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > w + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.hue.replace(")", `,${alpha})`).replace("rgb", "rgba").replace("#", "");
        // 用 hex 转 rgba
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.hue;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

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
