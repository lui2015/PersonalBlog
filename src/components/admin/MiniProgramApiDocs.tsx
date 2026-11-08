"use client";

import { useState } from "react";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://www.luliming.xyz";

const AUTH_HEADERS = `'X-Admin-User': 'luli',
    'X-Admin-Pass': 'luli116574'`;

/** 小程序端统一请求封装 */
const REQUEST_WRAPPER = `// app.js / utils/api.js —— 统一请求封装
const BASE = '${BASE_URL}';
const AUTH = { ${AUTH_HEADERS} };

function request(path, { method = 'GET', data, auth = false } = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE + path,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(auth ? AUTH : {}),
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject({ statusCode: res.statusCode, data: res.data });
      },
      fail: reject,
    });
  });
}

module.exports = { request, BASE };`;

/** 读取示例 */
const READ_SAMPLE = `const { request } = require('./utils/api');

// 1) 列表：默认最新在前，支持分页 / 搜索 / 排序
const res = await request('/api/open/quotes?page=1&pageSize=20&order=desc');
console.log(res.items, res.total, res.hasMore);  // hasMore 为 true 时 page+1 继续加载

// 2) 关键词搜索
const found = await request('/api/open/works?q=Next.js');

// 3) 单条详情
const detail = await request('/api/open/works/w1');

// 4) 首页信息（单例对象）
const hero = await request('/api/open/hero');

// 5) 数据字典（所有模块 + 字段说明 + 条目数）
const dict = await request('/api/open');`;

/** 写入示例 */
const WRITE_SAMPLE = `const { request } = require('./utils/api');

// 新增一条思考（需认证，id 由服务端自动生成）
const added = await request('/api/open/quotes', {
  method: 'POST', auth: true,
  data: { text: '今天的一点想法', author: '2026年11月' },
});

// 局部更新（只传要改的字段，id 不可改）
await request('/api/open/quotes/' + added.data.id, {
  method: 'PUT', auth: true,
  data: { text: '修改后内容' },
});

// 删除（前端请二次确认）
await request('/api/open/quotes/' + added.data.id, {
  method: 'DELETE', auth: true,
});`;

/** 上传示例 */
const UPLOAD_SAMPLE = `const { BASE } = require('./utils/api');

function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE + '/api/upload',
      filePath,
      name: 'file',
      header: { ${AUTH_HEADERS} },
      success: (res) => {
        const data = JSON.parse(res.data);
        // absoluteUrl 是完整地址，可直接放进 <image src> 或存入 image/cover/qr 字段
        if (data.ok) resolve(data.absoluteUrl);
        else reject(data);
      },
      fail: reject,
    });
  });
}

wx.chooseMedia({
  count: 1, mediaType: ['image'],
  success: async (r) => {
    const imageUrl = await uploadImage(r.tempFiles[0].tempFilePath);
    await request('/api/open/softwares', {
      method: 'POST', auth: true,
      data: { name: '我的小程序', image: imageUrl, description: '简介', url: 'https://example.com' },
    });
    wx.showToast({ title: '发布成功' });
  },
});`;

/** 一键复制给 AI 的完整提示词 */
const AI_PROMPT = `请帮我开发一个「个人版本微信小程序」，对接下面这套已上线的博客开放接口，实现数据展示与作品管理。

## 基础信息
- Base URL：${BASE_URL}（HTTPS）
- 所有 GET 读取接口公开，无需认证；POST/PUT/DELETE 与上传需要管理员凭据
- 认证请求头：X-Admin-User: luli 、 X-Admin-Pass: luli116574（也可用查询参数 ?user=luli&pass=luli116574）
- 所有接口已开启 CORS，响应均为 JSON，Cache-Control: no-store

## 小程序后台必须配置的合法域名
- request / uploadFile / downloadFile 合法域名：${BASE_URL}

## 接口清单
- GET  /api/open                     接口索引（所有模块、字段字典、条目数）
- GET  /api/open/{section}           模块列表，参数 page / pageSize(默认20,最大200) / order(desc默认|asc) / q(搜索)
- GET  /api/open/{section}/{id}      单条详情
- POST /api/open/{section}           新增一条（需认证，id 可不传，服务端自动生成）
- PUT  /api/open/{section}/{id}      局部更新一条（需认证，只传要改的字段）
- DELETE /api/open/{section}/{id}    删除一条（需认证）
- PUT  /api/open/{section}           整块替换该模块（需认证，慎用）
- GET  /api/content                  一次性获取全站数据
- POST /api/upload                   上传图片(multipart, 字段名 file)，返回 { ok, url, absoluteUrl }；小程序请用 absoluteUrl

## 数据模块（section）
hero(对象,只支持GET/PUT) / poems / photos / stats / skills / myskills / quotes / works / videos / albums / softwares / socialMedia

主要字段：
- poems: id, title, author, dynasty, date, content（必填 title, content）
- quotes: id, text, author（必填 text）
- works: id, slug, title, excerpt, date, category, tags[], readTime, cover, content（必填 title, slug）
- videos: id, title, category, duration, cover, views, date, src（必填 title）
- albums: id, name, cover, count, photos[{id,src,title}]（必填 name）
- softwares: id, name, image, description, url（必填 name）
- socialMedia: id, name, icon, desc, qr, color（必填 name）
- myskills: id, name, url, description?（必填 name, url）
- skills: id, name, level(0-100)（必填 name, level）
- stats: id, label, value(number), suffix, color（必填 label, value）
- photos: id, src, title, desc（必填 src）
- hero: title, subtitle, avatarText, avatarUrl

## 统一响应
成功 { ok: true, ... }（POST 为 201）；失败 { ok: false, error: "..." }
错误码：400 参数/缺必填/id重复、401 未认证、404 不存在、405 不支持的操作、413 文件超8MB、415 类型不支持

## 请求封装示例
\`\`\`js
${REQUEST_WRAPPER}
\`\`\`

## 读取示例
\`\`\`js
${READ_SAMPLE}
\`\`\`

## 写入示例
\`\`\`js
${WRITE_SAMPLE}
\`\`\`

## 上传示例
\`\`\`js
${UPLOAD_SAMPLE}
\`\`\`

## 要求
1. 首页展示 hero 信息 + 各作品模块入口；列表页用 /api/open/{section} 分页加载（下拉触底加载更多），默认最新在前。
2. 提供搜索框，用 q 参数过滤。
3. 详情页用 /api/open/{section}/{id}，文章正文用 markdown 渲染。
4. 管理员页支持新增/编辑/删除与图片上传，操作前二次确认。
5. 凭据放在单独配置文件，不要提交到公开仓库；做好 loading / 空态 / 错误提示。
6. 图片使用 absoluteUrl 完整地址显示。

请直接给出完整的小程序项目代码（app.js / app.json / pages / utils）。`;

const ENDPOINTS = [
  { method: "GET", path: "/api/open", desc: "接口索引：所有模块、字段字典、条目数", auth: false },
  { method: "GET", path: "/api/open/{section}", desc: "模块列表（分页 / 排序 / 搜索）", auth: false },
  { method: "GET", path: "/api/open/{section}/{id}", desc: "单条详情", auth: false },
  { method: "POST", path: "/api/open/{section}", desc: "新增一条（id 可自动生成）", auth: true },
  { method: "PUT", path: "/api/open/{section}/{id}", desc: "局部更新一条（合并字段）", auth: true },
  { method: "DELETE", path: "/api/open/{section}/{id}", desc: "删除一条", auth: true },
  { method: "PUT", path: "/api/open/{section}", desc: "整块替换该模块（慎用）", auth: true },
  { method: "POST", path: "/api/upload", desc: "上传图片，返回 url 与 absoluteUrl", auth: true },
  { method: "GET", path: "/api/content", desc: "一次性获取全站数据（兼容旧接口）", auth: false },
];

const SECTIONS = [
  { key: "hero", label: "首页信息", kind: "对象", required: "—", fields: "title, subtitle, avatarText, avatarUrl" },
  { key: "poems", label: "诗词作品", kind: "数组", required: "title, content", fields: "id, title, author, dynasty, date, content" },
  { key: "photos", label: "首页照片", kind: "数组", required: "src", fields: "id, src, title, desc" },
  { key: "stats", label: "统计数字", kind: "数组", required: "label, value", fields: "id, label, value, suffix, color" },
  { key: "skills", label: "技能雷达", kind: "数组", required: "name, level", fields: "id, name, level" },
  { key: "myskills", label: "技能作品", kind: "数组", required: "name, url", fields: "id, name, url, description?" },
  { key: "quotes", label: "我的思考", kind: "数组", required: "text", fields: "id, text, author" },
  { key: "works", label: "文章作品", kind: "数组", required: "title, slug", fields: "id, slug, title, excerpt, date, category, tags[], readTime, cover, content" },
  { key: "videos", label: "视频作品", kind: "数组", required: "title", fields: "id, title, category, duration, cover, views, date, src" },
  { key: "albums", label: "摄影相册", kind: "数组", required: "name", fields: "id, name, cover, count, photos[{id,src,title}]" },
  { key: "softwares", label: "软件作品", kind: "数组", required: "name", fields: "id, name, image, description, url" },
  { key: "socialMedia", label: "自媒体平台", kind: "数组", required: "name", fields: "id, name, icon, desc, qr, color" },
];

function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* ignore */
        }
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

function CodeBlock({ code, language = "javascript" }: { code: string; language?: string }) {
  return (
    <div className="relative group">
      <pre className="bg-cyber-black/80 border border-cyber-border/50 p-3 sm:p-4 overflow-x-auto text-[12px] leading-relaxed text-gray-300 font-[family-name:var(--font-mono)] max-h-96 overflow-y-auto">
        <code>{code}</code>
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
        <CopyButton text={code} />
      </div>
      <span className="absolute bottom-1 right-2 text-[9px] text-gray-600 font-[family-name:var(--font-mono)]">
        {language}
      </span>
    </div>
  );
}

export default function MiniProgramApiDocs() {
  return (
    <div className="space-y-5">
      {/* 一键复制完整提示词 */}
      <div className="cyber-card p-4 border-l-2 border-l-cyber-purple/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs text-cyber-purple font-[family-name:var(--font-orbitron)]">
              🤖 一键生成小程序
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              复制完整提示词给 AI 助手，即可直接生成对接全部接口的小程序项目代码。
            </p>
          </div>
          <CopyButton text={AI_PROMPT} label="复制完整提示词 →" />
        </div>
      </div>

      {/* 小程序配置 */}
      <div className="cyber-card p-4 border-l-2 border-l-yellow-400/50">
        <h3 className="text-xs text-yellow-400/90 font-[family-name:var(--font-orbitron)] mb-2">
          ⚠ 小程序后台域名配置（必做）
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-2">
          微信公众平台 → 开发管理 → 开发设置 → 服务器域名，将 <code className="text-cyber-green bg-cyber-black/60 px-1">{BASE_URL}</code> 加入以下合法域名（必须 HTTPS、已备案、不带端口和路径）：
        </p>
        <div className="text-[11px] font-[family-name:var(--font-mono)] text-gray-400 space-y-1">
          <div>• <span className="text-cyber-blue">request</span> 合法域名 → 调用所有 /api/... 接口</div>
          <div>• <span className="text-cyber-blue">uploadFile</span> 合法域名 → 上传图片</div>
          <div>• <span className="text-cyber-blue">downloadFile</span> / image → 显示 /uploads/... 图片</div>
          <div className="pt-1 text-gray-600">开发阶段可在微信开发者工具勾选「不校验合法域名」临时调试；示例占位图还涉及 images.unsplash.com、picsum.photos，如需显示也要加入。</div>
        </div>
      </div>

      {/* 认证说明 */}
      <div className="cyber-card p-4">
        <h3 className="text-xs text-cyber-green font-[family-name:var(--font-orbitron)] mb-2">
          🔑 认证规则
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-2">
          所有 <span className="text-emerald-400">GET 读取公开</span>；<span className="text-yellow-400">写入与上传需要管理员凭据</span>。小程序不能方便维护 Cookie，请固定用请求头（也可用查询参数）：
        </p>
        <CodeBlock
          language="http"
          code={`X-Admin-User: luli
X-Admin-Pass: luli116574

# 或等价地拼在 URL 上
${BASE_URL}/api/open/quotes?user=luli&pass=luli116574`}
        />
        <p className="text-[11px] text-gray-600 mt-2">
          未认证返回 401。凭据具备全站读写权限，请只放在个人小程序本地配置，勿提交公开仓库。
        </p>
      </div>

      {/* 接口总览 */}
      <div className="cyber-card p-5 space-y-3">
        <h3 className="text-sm text-cyber-blue font-[family-name:var(--font-orbitron)]">
          ◈ 接口总览（v1）
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-[family-name:var(--font-mono)] border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-cyber-border/40">
                <th className="text-left py-2 pr-2">METHOD</th>
                <th className="text-left py-2 pr-2">PATH</th>
                <th className="text-left py-2 pr-2">说明</th>
                <th className="text-left py-2">认证</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep) => (
                <tr key={ep.method + ep.path} className="border-b border-cyber-border/20">
                  <td className="py-2 pr-2">
                    <span className={ep.method === "GET" ? "text-emerald-400" : ep.method === "DELETE" ? "text-cyber-pink" : "text-yellow-400"}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2 pr-2 text-cyber-green whitespace-nowrap">{ep.path}</td>
                  <td className="py-2 pr-2 text-gray-400">{ep.desc}</td>
                  <td className="py-2">
                    {ep.auth ? (
                      <span className="text-yellow-400/80">需认证</span>
                    ) : (
                      <span className="text-gray-600">公开</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-600">
          列表接口通用参数：<code className="text-cyber-blue">page</code>（默认1）、<code className="text-cyber-blue">pageSize</code>（默认20，最大200）、<code className="text-cyber-blue">order</code>（desc 默认最新在前 / asc）、<code className="text-cyber-blue">q</code>（关键词搜索）。
        </p>
      </div>

      {/* 代码示例 */}
      <div className="cyber-card p-5 space-y-4">
        <h3 className="text-sm text-cyber-blue font-[family-name:var(--font-orbitron)]">
          📱 wx.request 示例
        </h3>
        <div>
          <p className="text-[10px] text-gray-600 mb-1.5 font-[family-name:var(--font-mono)]">1. 统一请求封装</p>
          <CodeBlock code={REQUEST_WRAPPER} />
        </div>
        <div>
          <p className="text-[10px] text-gray-600 mb-1.5 font-[family-name:var(--font-mono)]">2. 读取（列表 / 分页 / 搜索 / 详情 / 字典）</p>
          <CodeBlock code={READ_SAMPLE} />
        </div>
        <div>
          <p className="text-[10px] text-gray-600 mb-1.5 font-[family-name:var(--font-mono)]">3. 新增 / 修改 / 删除（需认证）</p>
          <CodeBlock code={WRITE_SAMPLE} />
        </div>
        <div>
          <p className="text-[10px] text-gray-600 mb-1.5 font-[family-name:var(--font-mono)]">4. 上传图片（wx.uploadFile → absoluteUrl）</p>
          <CodeBlock code={UPLOAD_SAMPLE} />
        </div>
      </div>

      {/* 数据模块字典 */}
      <div className="cyber-card p-5 space-y-3">
        <h3 className="text-sm text-cyber-blue font-[family-name:var(--font-orbitron)]">
          📐 数据模块字典（12 个 section）
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-[family-name:var(--font-mono)] border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-cyber-border/40">
                <th className="text-left py-2 pr-2">SECTION</th>
                <th className="text-left py-2 pr-2">名称</th>
                <th className="text-left py-2 pr-2">类型</th>
                <th className="text-left py-2 pr-2">新增必填</th>
                <th className="text-left py-2">字段</th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((s) => (
                <tr key={s.key} className="border-b border-cyber-border/20">
                  <td className="py-2 pr-2 text-cyber-green whitespace-nowrap">{s.key}</td>
                  <td className="py-2 pr-2 text-gray-300 whitespace-nowrap">{s.label}</td>
                  <td className="py-2 pr-2 text-gray-500 whitespace-nowrap">{s.kind}</td>
                  <td className="py-2 pr-2 text-yellow-400/70 whitespace-nowrap">{s.required}</td>
                  <td className="py-2 text-gray-500">{s.fields}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-600">
          图片的字段（src / image / cover / qr / avatarUrl / icon）建议填上传接口返回的 <code className="text-cyber-blue">absoluteUrl</code> 完整地址，小程序才能直接显示。
        </p>
      </div>

      {/* 错误码 */}
      <div className="cyber-card p-5 space-y-2">
        <h3 className="text-sm text-cyber-blue font-[family-name:var(--font-orbitron)]">
          ⚠ 错误码
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-[family-name:var(--font-mono)] text-gray-400">
          {[
            ["200 / 201", "成功（读取 / 新增）"],
            ["400", "参数错误 / 缺必填 / id 重复"],
            ["401", "未认证或凭据错误"],
            ["404", "模块或条目不存在"],
            ["405", "该模块不支持此操作"],
            ["413 / 415", "文件超 8MB / 类型不支持"],
          ].map(([code, desc]) => (
            <div key={code} className="bg-cyber-black/40 border border-cyber-border/30 p-2">
              <span className="text-cyber-pink">{code}</span>
              <span className="ml-2 text-gray-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
