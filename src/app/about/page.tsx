"use client";

import { motion } from "framer-motion";

const timeline = [
  { year: "2020", title: "开始编程之旅", desc: "接触 Web 前端开发" },
  { year: "2021", title: "全栈开发", desc: "学习 Node.js、数据库、云服务" },
  { year: "2022", title: "深入前端", desc: "React 生态系统，TypeScript" },
  { year: "2023", title: "开源贡献", desc: "参与多个开源项目" },
  { year: "2024", title: "技术分享", desc: "开始写博客和录制技术视频" },
  { year: "2025", title: "全栈创作者", desc: "融合技术与创意，持续输出" },
];

const socialLinks = [
  { name: "GitHub", url: "https://github.com", icon: "⟨/⟩" },
  { name: "Bilibili", url: "https://bilibili.com", icon: "▶" },
  { name: "微博", url: "https://weibo.com", icon: "W" },
  { name: "Email", url: "mailto:hello@example.com", icon: "✉" },
];

export default function AboutPage() {
  return (
    <div className="relative z-10 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1
            className="font-[family-name:var(--font-orbitron)] text-4xl md:text-5xl text-cyber-blue glitch mb-4"
            data-text="ABOUT ME"
          >
            ABOUT ME
          </h1>
          <p className="text-gray-500">// 了解更多关于我的信息</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-card p-8 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="hexagon w-40 h-40 overflow-hidden hologram">
                <img
                  src="https://picsum.photos/seed/avatar/400/400"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 发光环 */}
              <div className="absolute inset-0 hexagon border-2 border-cyber-blue/50 animate-pulse" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-[family-name:var(--font-orbitron)] text-2xl text-cyber-blue mb-2">
                CYBER_USER
              </h2>
              <p className="text-cyber-purple text-sm mb-4 font-[family-name:var(--font-mono)]">
                全栈开发者 / 创意编程爱好者
              </p>
              <p className="text-gray-300 leading-relaxed mb-6">
                热爱编程与创意设计，专注于 Web 全栈开发。喜欢探索技术与艺术的交汇点，
                用代码构建独特的数字体验。相信技术可以让世界更美好，也让生活更有趣。
                在这里，我分享技术心得、创意项目和生活感悟。
              </p>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center border border-cyber-border text-gray-400 hover:text-cyber-blue hover:border-cyber-blue hover:shadow-[0_0_10px_var(--color-cyber-blue)] transition-all duration-300 rounded"
                    title={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-purple mb-6 text-center">
            ◈ SKILL TREE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "React", "Next.js", "TypeScript", "Node.js",
              "Python", "TailwindCSS", "Three.js", "Docker",
              "PostgreSQL", "Redis", "GraphQL", "Figma",
            ].map((skill, i) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="cyber-card px-4 py-3 text-center text-sm text-gray-300 hover:text-cyber-blue hover:border-cyber-blue/50 transition-all cursor-default"
              >
                {skill}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-cyber-green mb-8 text-center">
            ◈ TIMELINE
          </h3>
          <div className="relative">
            {/* 中轴线 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyber-blue via-cyber-purple to-cyber-pink" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 ${
                    i % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex-1 ${
                      i % 2 === 0 ? "text-right" : "text-left"
                    }`}
                  >
                    <div className="cyber-card p-4 inline-block">
                      <span className="font-[family-name:var(--font-orbitron)] text-xs text-cyber-blue">
                        {item.year}
                      </span>
                      <h4 className="text-sm font-medium text-gray-200 mt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>

                  {/* 节点 */}
                  <div className="w-3 h-3 bg-cyber-blue rounded-full shadow-[0_0_10px_var(--color-cyber-blue)] z-10" />

                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
