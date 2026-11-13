"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContent } from "@/lib/ContentContext";
import { markdownToHtml } from "@/lib/markdown";

/** 客户端 useParams 对中文动态段会返回 percent-encoded 值，需兼容编码前后的形态 */
function decodeSlug(value: string): string {
  let result = value;
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(result);
      if (next === result) break;
      result = next;
    } catch {
      break;
    }
  }
  return result;
}

export default function BlogDetailPage() {
  const params = useParams();
  const rawSlug = String(params.slug ?? "");
  const slug = decodeSlug(rawSlug);
  const { content, ready } = useContent();

  // 兼容：原始值 / 解码值 / 编码值，并允许用 id 或标题访问，避免中文 slug 误判 404
  const candidates = new Set([rawSlug, slug]);
  const matches = (value: string) =>
    candidates.has(value) || candidates.has(encodeURIComponent(value));
  const post = content.works.find(
    (w) => matches(w.slug) || matches(w.id) || matches(w.title)
  );

  if (!ready) {
    return (
      <div className="relative z-10 pt-24 pb-16 text-center text-gray-500 font-[family-name:var(--font-mono)]">
        // 加载中...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1
            className="font-[family-name:var(--font-orbitron)] text-3xl text-cyber-pink glitch mb-4"
            data-text="404"
          >
            404
          </h1>
          <p className="text-gray-500 mb-6">
            没有找到 slug 为 <code className="text-cyber-pink">{slug}</code> 的作品
          </p>
          {content.works.length > 0 && (
            <div className="mb-6 text-sm text-gray-500">
              <p className="mb-2">可访问的文章：</p>
              <ul className="space-y-1">
                {content.works.map((w) => (
                  <li key={w.id}>
                    <Link
                      href={`/blog/${encodeURIComponent(w.slug)}`}
                      className="text-cyber-blue hover:underline"
                    >
                      {w.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            href="/blog"
            className="text-sm text-cyber-blue hover:underline font-[family-name:var(--font-mono)]"
          >
            ← 返回作品列表
          </Link>
        </div>
      </div>
    );
  }

  const contentHtml = markdownToHtml(post.content);

  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-cyber-blue transition-colors font-[family-name:var(--font-mono)]"
          >
            ← 返回作品列表
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-3xl md:text-4xl text-cyber-blue glitch mb-4"
            data-text={post.title}
          >
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 font-[family-name:var(--font-mono)] flex-wrap">
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readTime}</span>
            <span>·</span>
            <span className="text-cyber-purple">{post.category}</span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 border border-cyber-border text-gray-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.header>

        {post.cover && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-10 rounded overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover}
              alt="Cover"
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 scanlines" />
          </motion.div>
        )}

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <div className="cyber-card p-8 md:p-12">
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </motion.article>
      </div>
    </div>
  );
}
