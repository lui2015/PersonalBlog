"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const skills = [
  { name: "React/Next.js", level: 90 },
  { name: "TypeScript", level: 85 },
  { name: "Node.js", level: 80 },
  { name: "Python", level: 75 },
  { name: "UI/UX Design", level: 70 },
  { name: "DevOps", level: 65 },
];

export default function SkillRadarModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const maxRadius = size / 2 - 20;

    const drawRadar = () => {
      ctx.clearRect(0, 0, size, size);

      // 绘制网格圆
      for (let i = 1; i <= 5; i++) {
        const r = (maxRadius / 5) * i;
        ctx.beginPath();
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 绘制轴线
      const sides = skills.length;
      const angleStep = (Math.PI * 2) / sides;

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

      // 绘制数据多边形
      ctx.beginPath();
      skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (skill.level / 100) * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制数据点
      skills.forEach((skill, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (skill.level / 100) * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#00f0ff";
        ctx.fill();
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    drawRadar();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="cyber-card p-6 hud-corner"
    >
      <h3 className="font-[family-name:var(--font-orbitron)] text-sm text-cyber-blue mb-6">
        ◈ SKILL RADAR
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <canvas ref={canvasRef} className="w-[200px] h-[200px]" />

        <div className="flex-1 space-y-3 w-full">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{skill.name}</span>
                <span className="text-cyber-blue font-[family-name:var(--font-mono)]">
                  {skill.level}%
                </span>
              </div>
              <div className="h-1.5 bg-cyber-dark rounded overflow-hidden">
                <motion.div
                  className="h-full rounded"
                  style={{
                    background:
                      "linear-gradient(90deg, #00f0ff, #bf00ff)",
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
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
