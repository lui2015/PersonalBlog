"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

const postContent = `
## 引言

在当今的 Web 开发中，视觉设计越来越受到重视。赛博朋克风格以其独特的霓虹色彩、
未来感界面和沉浸式动画效果，成为了很多开发者追捧的设计方向。

## 核心技术

### 1. CSS 霓虹发光效果

使用 \`text-shadow\` 和 \`box-shadow\` 可以轻松实现霓虹发光效果：

\`\`\`css
.neon-text {
  text-shadow:
    0 0 7px #00f0ff,
    0 0 10px #00f0ff,
    0 0 21px #00f0ff,
    0 0 42px #00f0ff;
}
\`\`\`

### 2. Glitch 故障效果

通过 CSS 动画和 \`clip-path\` 实现经典的故障艺术效果：

\`\`\`css
.glitch::before {
  content: attr(data-text);
  position: absolute;
  color: #ff0080;
  animation: glitch-effect 3s infinite;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
}
\`\`\`

### 3. 粒子背景系统

利用 Canvas API 创建动态粒子网络，营造科技感氛围。

## 设计原则

1. **暗色为主**：深邃的黑色/深蓝色背景
2. **霓虹强调**：关键元素使用高饱和度的发光色
3. **动态交互**：鼠标悬停、滚动触发的动画反馈
4. **层次分明**：通过光影和模糊度区分前景和背景

## 总结

赛博朋克 UI 设计不仅仅是视觉上的酷炫，更是一种沉浸式的用户体验设计。
合理运用动画和光影效果，能让你的网站在众多产品中脱颖而出。
`;

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-cyber-blue transition-colors font-[family-name:var(--font-mono)]"
          >
            ← 返回博客列表
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-3xl md:text-4xl text-cyber-blue glitch mb-4"
            data-text="打造赛博朋克风格 UI 设计系统"
          >
            打造赛博朋克风格 UI 设计系统
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 font-[family-name:var(--font-mono)]">
            <span>2026-05-01</span>
            <span>·</span>
            <span>8 min read</span>
            <span>·</span>
            <span className="text-cyber-purple">技术</span>
          </div>

          <div className="flex gap-2 mt-3">
            {["CSS", "动画", "设计"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 border border-cyber-border text-gray-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.header>

        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-10 rounded overflow-hidden"
        >
          <img
            src={`https://picsum.photos/seed/${slug}/1200/500`}
            alt="Cover"
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 scanlines" />
        </motion.div>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <div className="cyber-card p-8 md:p-12">
            <div className="space-y-6 text-gray-300 leading-relaxed">
              {postContent.split("\n\n").map((paragraph, i) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="font-[family-name:var(--font-orbitron)] text-xl text-cyber-blue mt-8 mb-4"
                    >
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="font-[family-name:var(--font-rajdhani)] text-lg text-cyber-purple mt-6 mb-3"
                    >
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                if (paragraph.startsWith("```")) {
                  const code = paragraph.replace(/```\w*\n?/g, "");
                  return (
                    <pre
                      key={i}
                      className="bg-cyber-black border border-cyber-border p-4 rounded overflow-x-auto font-[family-name:var(--font-mono)] text-sm text-cyber-green"
                    >
                      <code>{code}</code>
                    </pre>
                  );
                }
                if (paragraph.startsWith("1.") || paragraph.startsWith("2.")) {
                  return (
                    <div key={i} className="pl-4 space-y-2">
                      {paragraph.split("\n").map((line, j) => (
                        <p key={j} className="text-gray-300">
                          {line}
                        </p>
                      ))}
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-gray-300">
                    {paragraph}
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
