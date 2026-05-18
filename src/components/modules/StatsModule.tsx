"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/lib/ContentContext";
import type { Stat } from "@/lib/types";

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

/**
 * 根据 stat.label 关键字推断跳转路径。
 * 命中则首页卡片可点击；未命中则保持纯展示。
 * - 文章 / 视频 / 相册 跳转独立路由
 * - 诗集 用首页锚点（PoemModule 在首页内嵌展示，没有独立路由）
 */
function inferHref(label: string): string | null {
  const l = label.trim();
  if (/文章|博客|作品|blog|article|post/i.test(l)) return "/blog";
  if (/视频|video/i.test(l)) return "/videos";
  if (/相册|图库|gallery|photo/i.test(l)) return "/gallery";
  if (/诗集|诗词|poem/i.test(l)) return "/#poems";
  return null;
}

export default function StatsModule() {
  const { content } = useContent();
  const stats = content.stats;

  if (stats.length === 0) return null;

  // 计算每张卡片实际展示的数值：
  // - 文章 / 相册 / 诗集 取真实数据长度，避免后台手填与现实不符
  // - 视频暂无统一数据源，沿用后台手填值
  // - 其他保持后台数值
  const resolveValue = (stat: Stat): number => {
    const l = stat.label.trim();
    if (/文章|博客|作品|blog|article|post/i.test(l))
      return content.works.length;
    if (/相册|图库|gallery|photo/i.test(l)) return content.photos.length;
    if (/诗集|诗词|poem/i.test(l)) return content.poems.length;
    return stat.value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="font-[family-name:var(--font-orbitron)] text-base sm:text-lg text-cyber-blue mb-4 sm:mb-6 text-center">
        ◈ SYSTEM STATUS
      </h3>

      <div
        className={`grid grid-cols-2 ${
          stats.length >= 4 ? "md:grid-cols-4" : `md:grid-cols-${stats.length}`
        } gap-3 sm:gap-4`}
      >
        {stats.map((stat, i) => {
          const href = inferHref(stat.label);
          const displayValue = resolveValue(stat);

          const cardInner = (
            <>
              <div
                className={`font-[family-name:var(--font-orbitron)] text-2xl sm:text-3xl md:text-4xl font-bold text-${stat.color} mb-1 sm:mb-2`}
              >
                <AnimatedNumber value={displayValue} />
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {stat.label}
                {stat.suffix && (
                  <span className="ml-1 text-gray-600">{stat.suffix}</span>
                )}
              </div>
            </>
          );

          const baseClass =
            "cyber-card p-4 sm:p-6 text-center breathing-border block";
          const interactiveClass = href
            ? " cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,229,255,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-blue"
            : "";

          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {href ? (
                <Link
                  href={href}
                  aria-label={`查看${stat.label}`}
                  className={baseClass + interactiveClass}
                >
                  {cardInner}
                </Link>
              ) : (
                <div className={baseClass}>{cardInner}</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
