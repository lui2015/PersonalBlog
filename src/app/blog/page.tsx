"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const categories = ["全部", "技术", "生活", "创意", "随笔"];

const posts = [
  {
    slug: "building-cyberpunk-ui",
    title: "打造赛博朋克风格 UI 设计系统",
    excerpt: "探索如何使用 CSS 动画和现代前端技术实现令人惊叹的赛博朋克视觉效果，包括霓虹发光、Glitch 动画、粒子系统等。",
    date: "2026-05-01",
    category: "技术",
    tags: ["CSS", "动画", "设计"],
    readTime: "8 min",
    cover: "https://picsum.photos/seed/post1/800/400",
  },
  {
    slug: "nextjs-performance",
    title: "Next.js 性能优化实战指南",
    excerpt: "从 SSR 到 ISR，深入理解 Next.js 渲染策略，掌握图片优化、代码分割、缓存策略等核心技巧。",
    date: "2026-04-25",
    category: "技术",
    tags: ["Next.js", "性能", "SSR"],
    readTime: "12 min",
    cover: "https://picsum.photos/seed/post2/800/400",
  },
  {
    slug: "creative-coding",
    title: "创意编程：用代码绘制艺术",
    excerpt: "利用 Canvas 和 WebGL 创造令人着迷的生成艺术作品，探索算法之美。",
    date: "2026-04-18",
    category: "创意",
    tags: ["Canvas", "WebGL", "生成艺术"],
    readTime: "6 min",
    cover: "https://picsum.photos/seed/post3/800/400",
  },
  {
    slug: "life-in-code",
    title: "程序员的日常：代码之外的生活",
    excerpt: "工作与生活的平衡、保持创造力的方法、以及我日常的一些思考和感悟。",
    date: "2026-04-10",
    category: "生活",
    tags: ["生活", "思考"],
    readTime: "5 min",
    cover: "https://picsum.photos/seed/post4/800/400",
  },
  {
    slug: "typescript-advanced",
    title: "TypeScript 高级类型体操",
    excerpt: "深入理解 TypeScript 条件类型、映射类型、模板字面量类型等高级特性。",
    date: "2026-04-05",
    category: "技术",
    tags: ["TypeScript", "类型系统"],
    readTime: "15 min",
    cover: "https://picsum.photos/seed/post5/800/400",
  },
  {
    slug: "random-thoughts",
    title: "关于时间、效率和内卷的思考",
    excerpt: "在信息爆炸的时代，如何找到自己的节奏，避免无意义的焦虑。",
    date: "2026-03-28",
    category: "随笔",
    tags: ["思考", "效率"],
    readTime: "4 min",
    cover: "https://picsum.photos/seed/post6/800/400",
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    const matchCategory =
      activeCategory === "全部" || post.category === activeCategory;
    const matchSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchCategory && (searchQuery === "" || matchSearch);
  });

  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl text-cyber-blue glitch mb-4"
            data-text="BLOG"
          >
            BLOG
          </h1>
          <p className="text-gray-500">// 技术探索、创意分享、生活感悟</p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cyber-dark/50 border border-cyber-border px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_var(--color-cyber-blue)] transition-all font-[family-name:var(--font-mono)]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
              ⌕
            </span>
          </div>

          {/* Categories */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs border transition-all duration-300 ${
                  activeCategory === cat
                    ? "border-cyber-blue text-cyber-blue shadow-[0_0_5px_var(--color-cyber-blue)]"
                    : "border-cyber-border text-gray-500 hover:border-gray-400 hover:text-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="cyber-card overflow-hidden group"
            >
              <Link href={`/blog/${post.slug}`}>
                {/* Cover */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyber-black to-transparent" />
                  <div className="absolute inset-0 scanlines opacity-50" />
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-cyber-purple/80 text-white rounded">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-lg font-medium text-gray-200 group-hover:text-cyber-blue transition-colors mb-2 line-clamp-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 border border-cyber-border text-gray-500"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
                      {post.date} · {post.readTime}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 font-[family-name:var(--font-mono)]">
              {"// 没有找到匹配的文章"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
