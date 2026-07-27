"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  trail: boolean;
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
  targetY: number;
}

const COLORS = [
  "#00f0ff", // cyber-blue
  "#ff0080", // cyber-pink
  "#a855f7", // cyber-purple
  "#22d3ee", // cyan
  "#f472b6", // pink
  "#c084fc", // purple
];

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createExplosion(x: number, y: number): Particle[] {
  const count = 40 + Math.floor(Math.random() * 30);
  const color = randomColor();
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 1.5 + Math.random() * 4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      decay: 0.008 + Math.random() * 0.015,
      color,
      size: 1 + Math.random() * 2.5,
      trail: Math.random() > 0.5,
    });
  }

  // 添加闪光核心
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 1.5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      decay: 0.03 + Math.random() * 0.02,
      color: "#ffffff",
      size: 1 + Math.random(),
      trail: false,
    });
  }

  return particles;
}

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 自动发射定时器
    let lastLaunch = Date.now();
    const launchInterval = 800 + Math.random() * 1200; // 0.8-2s 随机间隔

    const launchRocket = () => {
      const x = w * 0.15 + Math.random() * w * 0.7;
      const targetY = h * 0.1 + Math.random() * h * 0.35;
      rocketsRef.current.push({
        x,
        y: h + 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(6 + Math.random() * 4),
        color: randomColor(),
        exploded: false,
        targetY,
      });
    };

    // 初始发射几个
    setTimeout(launchRocket, 300);
    setTimeout(launchRocket, 800);

    const animate = () => {
      ctx.fillStyle = "rgba(6, 6, 10, 0.18)";
      ctx.fillRect(0, 0, w, h);

      const now = Date.now();
      if (now - lastLaunch > launchInterval) {
        launchRocket();
        lastLaunch = now;
      }

      // 更新火箭
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.06; // 重力

        // 火箭尾迹
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        // 发光
        ctx.beginPath();
        ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = r.color + "40";
        ctx.fill();

        if (r.y <= r.targetY || r.vy > 0) {
          if (!r.exploded) {
            r.exploded = true;
            particlesRef.current.push(...createExplosion(r.x, r.y));
          }
          rocketsRef.current.splice(i, 1);
        }
      }

      // 更新粒子
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.04; // 轻微重力
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // 粒子发光
        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color + "20";
          ctx.fill();
        }

        // 尾迹粒子画短线
        if (p.trail && p.alpha > 0.3) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.6;
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

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
