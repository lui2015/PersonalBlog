"use client";

import { useEffect, useRef } from "react";

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  wobbleAmp: number;
  wobbleSpeed: number;
  phase: number;
  hue: string;
  alpha: number;
}

const BUBBLE_COLORS = [
  "rgba(0, 240, 255, 1)",
  "rgba(180, 120, 255, 1)",
  "rgba(255, 110, 199, 1)",
  "rgba(120, 255, 220, 1)",
];

export default function BubblesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const spawnBubble = (atBottom = false): Bubble => {
      const r = 8 + Math.random() * 46;
      return {
        x: Math.random() * w,
        y: atBottom ? h + r : Math.random() * h,
        r,
        vy: 0.25 + Math.random() * 0.7,
        wobbleAmp: 12 + Math.random() * 30,
        wobbleSpeed: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        hue: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        alpha: 0.12 + Math.random() * 0.28,
      };
    };

    const initBubbles = () => {
      const count = Math.max(24, Math.floor((w * h) / 26000));
      const bubbles: Bubble[] = [];
      for (let i = 0; i < count; i++) bubbles.push(spawnBubble(false));
      bubblesRef.current = bubbles;
    };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initBubbles();
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
        const b = bubblesRef.current[i];
        const wob = Math.sin(t * 0.001 * b.wobbleSpeed + b.phase) * b.wobbleAmp;
        b.y -= b.vy;
        const drawX = b.x + wob;

        if (b.y + b.r < -10) {
          bubblesRef.current[i] = spawnBubble(true);
          continue;
        }

        // 泡泡主体：径向渐变（梦幻半透明）
        const grad = ctx.createRadialGradient(
          drawX - b.r * 0.3,
          b.y - b.r * 0.3,
          b.r * 0.1,
          drawX,
          b.y,
          b.r
        );
        grad.addColorStop(0, b.hue.replace("1)", `${b.alpha * 1.4})`));
        grad.addColorStop(0.7, b.hue.replace("1)", `${b.alpha * 0.5})`));
        grad.addColorStop(1, b.hue.replace("1)", "0)"));

        ctx.beginPath();
        ctx.arc(drawX, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // 边缘高光描边
        ctx.beginPath();
        ctx.arc(drawX, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = b.hue.replace("1)", `${b.alpha * 0.9})`);
        ctx.lineWidth = 1;
        ctx.stroke();

        // 反光小点
        ctx.beginPath();
        ctx.arc(
          drawX - b.r * 0.35,
          b.y - b.r * 0.35,
          Math.max(1, b.r * 0.12),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255,255,255,${Math.min(0.9, b.alpha * 2.2)})`;
        ctx.fill();
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
