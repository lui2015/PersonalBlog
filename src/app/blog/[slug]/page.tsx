"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useContent } from "@/lib/ContentContext";

interface Block {
  type: "h2" | "h3" | "code" | "list" | "p";
  content: string;
}

function parseMarkdown(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.replace(/\r\n/g, "\n").split("\n\n");
  for (const raw of lines) {
    const para = raw.trim();
    if (!para) continue;
    if (para.startsWith("## ")) {
      blocks.push({ type: "h2", content: para.replace(/^##\s+/, "") });
    } else if (para.startsWith("### ")) {
      blocks.push({ type: "h3", content: para.replace(/^###\s+/, "") });
    } else if (para.startsWith("```")) {
      blocks.push({ type: "code", content: para.replace(/```\w*\n?/g, "") });
    } else if (/^\d+\.\s/.test(para) || /^-\s/.test(para)) {
      blocks.push({ type: "list", content: para });
    } else {
      blocks.push({ type: "p", content: para });
    }
  }
  return blocks;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { content, ready } = useContent();

  const post = content.works.find((w) => w.slug === slug);

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

  const blocks = parseMarkdown(post.content);

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
            <div className="space-y-6 text-gray-300 leading-relaxed">
              {blocks.map((block, i) => {
                if (block.type === "h2") {
                  return (
                    <h2
                      key={i}
                      className="font-[family-name:var(--font-orbitron)] text-xl text-cyber-blue mt-8 mb-4"
                    >
                      {block.content}
                    </h2>
                  );
                }
                if (block.type === "h3") {
                  return (
                    <h3
                      key={i}
                      className="font-[family-name:var(--font-rajdhani)] text-lg text-cyber-purple mt-6 mb-3"
                    >
                      {block.content}
                    </h3>
                  );
                }
                if (block.type === "code") {
                  return (
                    <pre
                      key={i}
                      className="bg-cyber-black border border-cyber-border p-4 rounded overflow-x-auto font-[family-name:var(--font-mono)] text-sm text-cyber-green"
                    >
                      <code>{block.content}</code>
                    </pre>
                  );
                }
                if (block.type === "list") {
                  return (
                    <div key={i} className="pl-4 space-y-2">
                      {block.content.split("\n").map((line, j) => (
                        <p key={j} className="text-gray-300">
                          {line}
                        </p>
                      ))}
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-gray-300 whitespace-pre-line">
                    {block.content}
                  </p>
                );
              })}
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
