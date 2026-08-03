"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const hobbies = [
  { id: "finance", name: "金融", level: 30 },
  { id: "coding", name: "编程", level: 30 },
  { id: "reading", name: "阅读", level: 20 },
  { id: "shortvideo", name: "短视频", level: 10 },
  { id: "pet", name: "养宠", level: 10 },
];

export default function SkillRadarModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (hobbies.length < 3) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const maxRadius = size / 2 - 24;

    ctx.clearRect(0, 0, size, size);

    // 网格圆
    for (let i = 1; i <= 5; i++) {
      const r = (maxRadius / 5) * i;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const sides = hobbies.length;
    const angleStep = (Math.PI * 2) / sides;

    // 轴线
    for (let i = 0; i < sides; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x = center + Math.cos(angle) * maxRadius;
      const y = center + Math.sin(angle) * maxRadius;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
      ctx.stroke();
    }

    // 数据多边形
    ctx.beginPath();
    hobbies.forEach((item, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (Math.max(0, Math.min(100, item.level)) / 100) * maxRadius;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // 外发光层
    ctx.save();
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 24;
    ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
    ctx.fill();
    ctx.restore();

    // 填充
    ctx.fillStyle = "rgba(0, 240, 255, 0.22)";
    ctx.fill();
    // 描边
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 数据点 + 标签
    hobbies.forEach((item, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (Math.max(0, Math.min(100, item.level)) / 100) * maxRadius;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;

      // 数据点
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#00f0ff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 20;
      ctx.fill();
      // 内核白点
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 0;
      ctx.fill();

      // 标签（在轴线上方）
      const labelR = maxRadius + 16;
      const lx = center + Math.cos(angle) * labelR;
      const ly = center + Math.sin(angle) * labelR;
      ctx.font = "12px system-ui";
      ctx.fillStyle = "rgba(200,220,255,0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.name, lx, ly);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-4 sm:p-6 hud-corner"
    >
      <h3 className="font-[family-name:var(--font-orbitron)] text-xs sm:text-sm text-cyber-blue mb-4 sm:mb-6">
        ◈ HOBBY
      </h3>

      <div className="flex flex-col items-center gap-4 sm:gap-6">
        <canvas ref={canvasRef} className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px]" />

        <div className="w-full space-y-2.5 sm:space-y-3">
          {hobbies.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{item.name}</span>
                <span className="text-cyber-blue font-[family-name:var(--font-mono)]">
                  {item.level}%
                </span>
              </div>
              <div className="h-1.5 bg-cyber-dark rounded overflow-hidden">
                <motion.div
                  className="h-full rounded"
                  style={{
                    background: "linear-gradient(90deg, #00f0ff, #bf00ff)",
                  }}
                  initial={{ width: 0 }}
                  whileInView={{
                    width: `${Math.max(0, Math.min(100, item.level))}%`,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
