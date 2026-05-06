"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "文章", value: 42, suffix: "篇", color: "cyber-blue" },
  { label: "视频", value: 18, suffix: "个", color: "cyber-purple" },
  { label: "相册", value: 7, suffix: "组", color: "cyber-pink" },
  { label: "访客", value: 12580, suffix: "", color: "cyber-green" },
];

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export default function StatsModule() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-blue mb-6 text-center">
        ◈ SYSTEM STATUS
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="cyber-card p-6 text-center breathing-border"
          >
            <div
              className={`font-[family-name:var(--font-orbitron)] text-3xl md:text-4xl font-bold text-${stat.color} mb-2`}
            >
              <AnimatedNumber value={stat.value} />
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              {stat.label}
              {stat.suffix && (
                <span className="ml-1 text-gray-600">{stat.suffix}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
