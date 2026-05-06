"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const posts = [
  {
    slug: "building-cyberpunk-ui",
    title: "打造赛博朋克风格 UI 设计系统",
    excerpt: "探索如何使用 CSS 动画和现代前端技术实现令人惊叹的赛博朋克视觉效果...",
    date: "2026-05-01",
    category: "技术",
    readTime: "8 min",
  },
  {
    slug: "nextjs-performance",
    title: "Next.js 性能优化实战指南",
    excerpt: "从 SSR 到 ISR，深入理解 Next.js 渲染策略，打造极致用户体验...",
    date: "2026-04-25",
    category: "技术",
    readTime: "12 min",
  },
  {
    slug: "creative-coding",
    title: "创意编程：用代码绘制艺术",
    excerpt: "利用 Canvas 和 WebGL 创造令人着迷的生成艺术作品...",
    date: "2026-04-18",
    category: "创意",
    readTime: "6 min",
  },
];

export default function LatestBlogModule() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-blue">
          ◈ LATEST POSTS
        </h3>
        <Link
          href="/blog"
          className="text-xs text-gray-500 hover:text-cyber-blue border border-cyber-border px-3 py-1 hover:border-cyber-blue transition-all"
        >
          查看全部 →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="cyber-card p-5 group cursor-pointer hover:border-cyber-blue/50 transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 border border-cyber-purple/50 text-cyber-purple rounded">
                {post.category}
              </span>
              <span className="text-[10px] text-gray-500">{post.readTime}</span>
            </div>

            <h4 className="text-base font-medium text-gray-200 group-hover:text-cyber-blue transition-colors mb-2 line-clamp-2">
              {post.title}
            </h4>

            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {post.excerpt}
            </p>

            <div className="text-xs text-gray-600 font-[family-name:var(--font-mono)]">
              {post.date}
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
