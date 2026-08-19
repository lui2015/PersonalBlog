"use client";

import { useState } from "react";
import AdminPanel, { btnGhost } from "@/components/admin/AdminPanel";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  bodyExample?: string;
  responseExample: string;
  prompt?: string; // 一键复制给 AI 的提示词
}

const endpoints: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/content",
    description: "获取站点全部内容数据（公开，无需认证）",
    auth: false,
    responseExample: `{
  "hero": { "title": "鲁力铭", "subtitle": "...", ... },
  "poems": [...],
  "photos": [...],
  "stats": [...],
  "skills": [...],
  "myskills": [...],
  "quotes": [...],
  "works": [...],
  "videos": [...],
  "albums": [...],
  "softwares": [...]
}`,
    prompt: `请帮我调用以下 API 获取站点内容：

\`\`\`bash
curl -s ${BASE_URL}/api/content | python3 -m json.tool
\`\`\`

返回的是完整的站点 JSON 数据，包含诗词、作品、思考、相册、软件等所有模块。`,
  },
  {
    method: "PUT",
    path: "/api/content",
    description: "更新站点内容（需管理员登录）",
    auth: true,
    bodyExample: `{
  "hero": { "title": "鲁力铭", "subtitle": "...", "avatarText": "鲁", "avatarUrl": "" },
  "poems": [],
  "photos": [],
  "stats": [],
  "skills": [],
  "myskills": [],
  "quotes": [],
  "works": [],
  "videos": [],
  "albums": [],
  "softwares": []
}`,
    responseExample: `{ "ok": true }`,
    prompt: `请帮我通过以下步骤更新站点内容：

**第1步：先获取当前数据**
\`\`\`bash
curl -s ${BASE_URL}/api/content > site.json && cat site.json | python3 -m json.tool
\`\`\`

**第2步：修改 JSON 文件中对应字段（如 softwares 新增软件）**

**第3步：提交更新（需要先登录获取 cookie）**
\`\`\`bash
# 先登录获取 session cookie
COOKIE=$(curl -s -c - -X POST ${BASE_URL}/api/login \\
  -H 'Content-Type: application/json' \\
  -d '{"username":"luli","password":"luli116574"}' | grep -v '#' | awk '{print $6"="$7}' | tr '\\n' ';')

# 用 cookie 提交更新
curl -s -X PUT ${BASE_URL}/api/content \\
  -H 'Content-Type: application/json' \\
  -b "$COOKIE" \\
  -d @site.json
\`\`\``,
  },
  {
    method: "POST",
    path: "/api/upload",
    description: "上传图片文件（需管理员登录），返回图片 URL",
    auth: true,
    responseExample: `{ "ok": true, "url": "/uploads/xxx.jpg" }`,
    prompt: `请帮我上传一张图片到站点：

\`\`\`bash
# 先登录获取 session cookie
COOKIE=$(curl -s -c - -X POST ${BASE_URL}/api/login \\
  -H 'Content-Type: application/json' \\
  -d '{"username":"luli","password":"luli116574"}' | grep -v '#' | awk '{print $6"="$7}' | tr '\\n' ';')

# 上传图片（支持 jpg/png/webp/gif/svg，最大 8MB）
curl -s -X POST ${BASE_URL}/api/upload \\
  -F "file=@/path/to/your/image.jpg" \\
  -b "$COOKIE"
\`\`\`

返回的 \`url\` 字段就是图片地址，可用于 softwares 的 image 字段或 works 的 cover 字段。`,
  },
];

/** 常用场景：一键复制提示词 */
const scenarios = [
  {
    title: "新增软件作品",
    icon: "💿",
    prompt: `我想在个人博客「鲁力铭」上新增一个软件作品。请帮我按以下步骤操作：

## 1. 上传软件封面图
用 curl 调用上传接口：
\`\`\`bash
# 登录并上传封面
SESSION_COOKIE=$(curl -si -X POST "${BASE_URL}/api/login" -H "Content-Type: application/json" -d '{"username":"luli","password":"luli116574"}' | grep -i "set-cookie:" | sed 's/set-cookie: //i' | cut -d';' -f1)

curl -X POST "${BASE_URL}/api/upload" -F "file=@/path/to/cover.png" -b "$SESSION_COOKIE"
\`\`\`
记下返回的 url。

## 2. 更新站点数据
\`\`\`bash
# 获取当前数据
curl -s "${BASE_URL}/api/content" > data.json

# 在 softwares 数组末尾追加新条目：
# { "id": "sw_唯一ID", "name": "软件名称", "image": "上面返回的url", "description": "简介", "url": "跳转链接" }

# 提交更新
curl -X PUT "${BASE_URL}/api/content" -H "Content-Type: application/json" -b "$SESSION_COOKIE" -d @data.json
\`\`\`

站点地址：${BASE_URL}`,
  },
  {
    title: "新增摄影作品",
    icon: "📷",
    prompt: `我想在个人博客「鲁力铭」上新增一组摄影照片到 AboutMe 相册。请帮我操作：

## 1. 上传照片
\`\`\`bash
# 登录
SESSION_COOKIE=$(curl -si -X POST "${BASE_URL}/api/login" -H "Content-Type: application/json" -d '{"username":"luli","password":"luli116574"}' | grep -i "set-cookie:" | sed 's/set-cookie: //i' | cut -d';' -f1)

# 批量上传（每张图调一次）
for f in /path/to/photos/*.jpg; do
  curl -X POST "${BASE_URL}/api/upload" -F "file=@$f" -b "$SESSION_COOKIE"
done
\`\`\`

## 2. 更新 albums 中 AboutMe 相册的 photos 数组
\`\`\`bash
curl -s "${BASE_URL}/api/content" > data.json
# 编辑 data.json → albums → 找 name 为 "AboutMe" 的相册 → photos 数组添加新条目
# 每张: { "id": "photo_唯一ID", "src": "上传返回的url", "title": "照片标题" }
curl -X PUT "${BASE_URL}/api/content" -H "Content-Type: application/json" -b "$SESSION_COOKIE" -d @data.json
\`\`\`

站点地址：${BASE_URL}`,
  },
  {
    title: "新增文章/思考",
    icon: "📝",
    prompt: `我想在个人博客「鲁力铭」上新增一条思考记录。请帮我操作：

## 直接调用 API
\`\`\`bash
# 登录
SESSION_COOKIE=$(curl -si -X POST "${BASE_URL}/api/login" -H "Content-Type: application/json" -d '{"username":"luli","password":"luli116574"}' | grep -i "set-cookie:" | sed 's/set-cookie: //i' | cut -d';' -f1)

# 获取当前数据
curl -s "${BASE_URL}/api/content" > data.json

# 编辑 data.json → quotes 数组末尾追加：
# { "id": "t_时间戳", "text": "你的思考内容", "author": "2026年" }

# 提交
curl -X PUT "${BASE_URL}/api/content" -H "Content-Type: application/json" -b "$SESSION_COOKIE" -d @data.json
\`\`\`

站点地址：${BASE_URL}`,
  },
];

function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`text-[11px] px-2.5 py-1 border transition-all font-[family-name:var(--font-mono)] ${
        copied
          ? "border-emerald-400/60 text-emerald-400"
          : "border-cyber-border text-gray-400 hover:text-cyber-green hover:border-cyber-green/50"
      }`}
    >
      {copied ? "✓ 已复制" : label}
    </button>
  );
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <div className="relative group">
      <pre className="bg-cyber-black/80 border border-cyber-border/50 p-3 sm:p-4 overflow-x-auto text-[12px] leading-relaxed text-gray-300 font-[family-name:var(--font-mono)]">
        <code>{code}</code>
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
        <CopyButton text={code} />
      </div>
      {language && (
        <span className="absolute bottom-1 right-2 text-[9px] text-gray-600 font-[family-name:var(--font-mono)]">
          {language}
        </span>
      )}
    </div>
  );
}

export default function OpenPlatformPage() {
  const [activeTab, setActiveTab] = useState<"endpoints" | "scenarios">("endpoints");

  return (
    <AdminPanel
      title="OPEN PLATFORM"
      description="开放 API 接口文档 · 外部可调用接口管理站点内容"
      action={
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 font-[family-name:var(--font-mono)]">
            BASE: {BASE_URL || "..."}
          </span>
        </div>
      }
    >
      {/* Tab 切换 */}
      <div className="flex gap-1 mb-6 border-b border-cyber-border/30 pb-3">
        {(["endpoints", "scenarios"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm px-4 py-1.5 font-[family-name:var(--font-mono)] transition-all border-b-2 ${
              activeTab === tab
                ? "border-cyber-blue text-cyber-blue"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab === "endpoints" ? "◈ API 接口" : "⚡ 快捷场景"}
          </button>
        ))}
      </div>

      {/* === 接口列表 === */}
      {activeTab === "endpoints" && (
        <div className="space-y-5">
          {/* 认证说明 */}
          <div className="cyber-card p-4 border-l-2 border-l-yellow-400/50">
            <h3 className="text-xs text-yellow-400/90 font-[family-name:var(--font-orbitron)] mb-2">
              ⚠ 认证说明
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              需要认证的接口（PUT/POST）必须携带有效的 session cookie。
              通过 <code className="text-cyber-green bg-cyber-black/60 px-1">POST /api/login</code> 登录获取。
              Cookie 名：<code className="text-cyber-green bg-cyber-black/60 px-1">session_id</code>
            </p>
            <CodeBlock
              code={`# 登录获取 session
curl -s -c cookies.txt -X POST ${BASE_URL}/api/login \\
  -H 'Content-Type: application/json' \\
  -d '{"username":"luli","password":"<密码>"}'

# 后续请求带上 cookie
curl -s -X PUT ${BASE_URL}/api/content \\
  -H 'Content-Type: application/json' \\
  -b cookies.txt \\
  -d @data.json`}
            />
          </div>

          {/* 各接口 */}
          {endpoints.map((ep) => (
            <div key={ep.path} className="cyber-card p-5 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 font-[family-name:var(--font-mono)] ${
                    ep.method === "GET"
                      ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/30"
                      : ep.method === "PUT"
                        ? "bg-yellow-400/15 text-yellow-400 border border-yellow-400/30"
                        : "bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30"
                  }`}
                >
                  {ep.method}
                </span>
                <code className="text-sm text-cyber-green font-[family-name:var(--font-mono)]">
                  {ep.path}
                </code>
                {ep.auth && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-400/10 text-yellow-400/80 border border-yellow-400/20 font-[family-name:var(--font-mono)]">
                    需认证
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{ep.description}</p>

              {/* Body 示例 */}
              {ep.bodyExample && (
                <div>
                  <p className="text-[10px] text-gray-600 mb-1.5 font-[family-name:var(--font-mono)]">
                    REQUEST BODY (JSON)
                  </p>
                  <CodeBlock code={ep.bodyExample} language="json" />
                </div>
              )}

              {/* Response 示例 */}
              <div>
                <p className="text-[10px] text-gray-600 mb-1.5 font-[family-name:var(--font-mono)]">
                  RESPONSE
                </p>
                <CodeBlock code={ep.responseExample} language="json" />
              </div>

              {/* 一键复制提示词 */}
              {ep.prompt && (
                <div className="pt-2 border-t border-cyber-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-cyber-purple/70 font-[family-name:var(--font-mono)]">
                      🤖 AI 提示词（一键复制给 AI 助手）
                    </p>
                    <CopyButton text={ep.prompt} label="复制提示词" />
                  </div>
                  <div className="bg-cyber-purple/5 border border-cyber-purple/20 p-3 rounded text-[11px] text-gray-400 leading-relaxed max-h-32 overflow-y-auto">
                    {ep.prompt}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 数据模型参考 */}
          <div className="cyber-card p-5 space-y-3">
            <h3 className="text-sm text-cyber-blue font-[family-name:var(--font-orbitron)]">
              📐 数据模型速查
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-[family-name:var(--font-mono)]">
              {[
                { name: "SoftwareWork", fields: "{ id, name, image, description, url }" },
                { name: "Work", fields: "{ id, slug, title, excerpt, date, category, tags, readTime, cover, content }" },
                { name: "Photo/GalleryPhoto", fields: "{ id, src, title }" },
                { name: "Quote", fields: "{ id, text, author }" },
                { name: "Poem", fields: "{ id, title, author, date, content }" },
                { name: "Skill", fields: "{ id, name, level(0-100) }" },
                { name: "Video", fields: "{ id, title, category, duration, cover, views, date, src }" },
                { name: "GalleryAlbum", fields: "{ id, name, cover, count, photos[] }" },
              ].map((m) => (
                <div key={m.name} className="bg-cyber-black/40 border border-cyber-border/30 p-2.5">
                  <span className="text-cyber-green">{m.name}</span>
                  <span className="text-gray-600 ml-2">{m.fields}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === 快捷场景 === */}
      {activeTab === "scenarios" && (
        <div className="space-y-5">
          <p className="text-xs text-gray-500">
            选择场景后一键复制完整提示词，直接粘贴给 AI 助手即可自动执行操作。
          </p>
          {scenarios.map((s) => (
            <div key={s.title} className="cyber-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <h3 className="text-sm text-cyber-blue font-[family-name:var(--font-orbitron)]">
                    {s.title}
                  </h3>
                </div>
                <CopyButton text={s.prompt} label="复制完整提示词 →" />
              </div>
              <div className="bg-cyber-black/40 border border-cyber-border/30 p-3 max-h-64 overflow-y-auto">
                <pre className="text-[11px] text-gray-400 whitespace-pre-wrap leading-relaxed font-[family-name:var(--font-mono)]">
                  {s.prompt}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
