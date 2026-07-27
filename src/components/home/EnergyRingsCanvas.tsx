"use client";

import { useEffect, useRef } from "react";

interface Ring {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  hue: string;
  speed: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: string;
}

const RING_COLORS = ["#00f0ff", "#b478ff", "#ff6ec7"];
const SPARK_COLORS = ["#00f0ff", "#78ffdc", "#ff6ec7"];

export default function EnergyRingsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const rings: Ring[] = [];
    const sparks: Spark[] = [];
    let lastSpawn = 0;

    const spawnRing = () => {
      // 从屏幕边缘或中心区域随机位置产生
      let x: number, y: number;
      if (Math.random() > 0.5) {
        x = Math.random() * w;
        y = Math.random() > 0.5 ? -20 : h + 20;
      } else {
        x = Math.random() > 0.5 ? -20 : w + 20;
        y = Math.random() * h;
      }
      rings.push({
        x,
        y,
        r: 1,
        maxR: 60 + Math.random() * 140,
        alpha: 0.7 + Math.random() * 0.3,
        hue: RING_COLORS[Math.floor(Math.random() * RING_COLORS.length)],
        speed: 0.8 + Math.random() * 1.5,
      });
    };

    const spawnSparks = (x: number, y: number) => {
      const count = 6 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 1.5 + Math.random() * 3;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 30 + Math.random() * 35,
          size: 1 + Math.random() * 2,
          hue: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        });
      }
    };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = (t: number) => {
      ctx.fillStyle = "rgba(6,6,10,0.14)";
      ctx.fillRect(0, 0, w, h);

      // 定时生成新环
      if (t - lastSpawn > 600 + Math.random() * 800) {
        spawnRing();
        lastSpawn = t;
      }

      // 绘制环
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.r += ring.speed;
        const progress = ring.r / ring.maxR;
        const alpha = ring.alpha * (1 - progress);

        if (ring.r >= ring.maxR) {
          // 环消失时产生火花
          spawnSparks(ring.x, ring.y);
          rings.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.hue;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.5 + (1 - progress) * 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ring.hue;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // 内层细环（双层效果）
        if (ring.r > 10) {
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r * 0.65, 0, Math.PI * 2);
          ctx.strokeStyle = ring.hue;
          ctx.globalAlpha = alpha * 0.4;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // 更新火花
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.97;
        s.vy *= 0.97;
        s.life++;

        const progress = s.life / s.maxLife;
        const alpha = 1 - progress;

        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1 - progress * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = s.hue;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.hue;
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
