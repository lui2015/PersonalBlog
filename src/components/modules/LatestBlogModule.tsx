"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useContent } from "@/lib/ContentContext";

export default function LatestBlogModule() {
  const { content } = useContent();
  const posts = content.works.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h3 className="font-[family-name:var(--font-orbitron)] text-base sm:text-lg text-cyber-blue">
          ◈ LATEST WORKS
        </h3>
        <Link
          href="/blog"
          className="text-xs text-gray-500 hover:text-cyber-blue border border-cyber-border px-3 py-1.5 hover:border-cyber-blue transition-all whitespace-nowrap shrink-0"
        >
          查看全部 →
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="cyber-card p-8 text-center text-gray-500 text-sm font-[family-name:var(--font-mono)]">
          // 还没有作品
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="cyber-card p-4 sm:p-5 group hover:border-cyber-blue/50 transition-all duration-300"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-[10px] px-2 py-0.5 border border-cyber-purple/50 text-cyber-purple rounded">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {post.readTime}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-medium text-gray-200 group-hover:text-cyber-blue transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h4>

                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3">
                  {post.excerpt}
                </p>

                <div className="text-[10px] sm:text-xs text-gray-600 font-[family-name:var(--font-mono)]">
                  {post.date}
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </motion.div>
  );
}
