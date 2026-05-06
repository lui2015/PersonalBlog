"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContent } from "@/lib/ContentContext";

export default function BlogPage() {
  const { content } = useContent();
  const works = content.works;

  const categories = useMemo(() => {
    const set = new Set<string>();
    works.forEach((w) => set.add(w.category));
    return ["全部", ...Array.from(set)];
  }, [works]);

  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = works.filter((post) => {
    const matchCategory =
      activeCategory === "全部" || post.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      post.title.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q));
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
            data-text="WORKS"
          >
            WORKS
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
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="搜索作品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cyber-dark/50 border border-cyber-border px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_10px_var(--color-cyber-blue)] transition-all font-[family-name:var(--font-mono)]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">
              ⌕
            </span>
          </div>

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
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="cyber-card overflow-hidden group"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
              {"// 没有找到匹配的作品"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
