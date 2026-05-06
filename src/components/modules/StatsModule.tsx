"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";

function AnimatedNumber({
  value,
  duration = 2000,
}: {
  value: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    let start = 0;
    const target = Number(value) || 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
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
  const { content } = useContent();
  const stats = content.stats;

  if (stats.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-blue mb-6 text-center">
        ◈ SYSTEM STATUS
      </h3>

      <div
        className={`grid grid-cols-2 ${
          stats.length >= 4 ? "md:grid-cols-4" : `md:grid-cols-${stats.length}`
        } gap-4`}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
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
