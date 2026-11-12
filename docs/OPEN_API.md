# 个人博客开放接口文档（小程序客户端版）

> 版本：v1.1 ｜ 更新日期：2026-11-11
> 用途：供「个人版本小程序客户端」读取与维护站点全部数据（含「关于我」页面）。
> 线上 Base URL：`https://www.luliming.xyz`

---

## 1. 接入前必读（小程序配置）

微信小程序默认不能随意请求外部域名，需先在 **微信公众平台 → 开发管理 → 开发设置 → 服务器域名** 配置：

| 用途 | 合法域名 | 说明 |
|------|----------|------|
| `request` 合法域名 | `https://www.luliming.xyz` | 调用所有 `/api/...` 接口 |
| `uploadFile` 合法域名 | `https://www.luliming.xyz` | 上传图片到 `/api/upload` |
| `downloadFile` 合法域名 | `https://www.luliming.xyz` | 下载/预览 `/uploads/...` 图片 |
| `image`（若用 `<image>` 直接显示） | `https://www.luliming.xyz` | 显示头像、封面、二维码 |

- 域名必须 **HTTPS**、已备案，且不能带端口和路径。
- 开发阶段可在微信开发者工具勾选「不校验合法域名」临时调试。
- 所有接口已开启 CORS（`Access-Control-Allow-Origin: *`），也支持 H5 / 浏览器 / 第三方客户端直接调用。
- 所有响应均为 `application/json; charset=utf-8`，且 `Cache-Control: no-store`（不缓存，改动即时生效）。

> 图片资源站点内还有 `https://images.unsplash.com`、`https://picsum.photos`（示例占位图），若小程序要显示这些图，也需加入相应合法域名。

---

## 2. 认证规则

| 操作 | 是否认证 | 说明 |
|------|----------|------|
| 所有 `GET` 读取 | ❌ 公开 | 无需任何凭据，直接请求 |
| `POST` / `PUT` / `DELETE` 写入 | ✅ 需要 | 管理员账号密码 |
| `POST /api/upload` 上传图片 | ✅ 需要 | 管理员账号密码 |

**认证方式（三选一，小程序推荐方式一）**

方式一 · 请求头（推荐）：
```
X-Admin-User: luli
X-Admin-Pass: luli116574
```

方式二 · 查询参数（URL 拼接）：
```
?user=luli&pass=luli116574
```

方式三 · Session Cookie（仅 Web 后台登录态，小程序不用）：
```
Cookie: admin_session=...
```

> ⚠️ 小程序无法方便维护 Cookie，**请固定使用请求头方式一**。凭据请放在小程序端配置里，不要硬编码提交到公开仓库。
> 未认证或凭据错误时返回 `401 { "ok": false, "error": "unauthorized" }`。

---

## 3. 接口总览

### 3.1 开放数据接口（`/api/open`，v1，推荐小程序使用）

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/open` | ❌ | 接口索引：所有模块、字段字典、条目数 |
| GET | `/api/open/{section}` | ❌ | 模块列表（分页/排序/搜索） |
| GET | `/api/open/{section}/{id}` | ❌ | 单条详情 |
| POST | `/api/open/{section}` | ✅ | 新增一条 |
| PUT | `/api/open/{section}/{id}` | ✅ | 局部更新一条（合并字段） |
| DELETE | `/api/open/{section}/{id}` | ✅ | 删除一条 |
| PUT | `/api/open/{section}` | ✅ | 数组模块＝整块替换（慎用）；对象模块（hero/about）＝字段合并 |

### 3.2 其他可用接口

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/content` | ❌ | 一次性获取站点全部数据（大 JSON） |
| PUT | `/api/content` | ✅ | 一次性覆盖全部数据（不推荐，易误删） |
| POST | `/api/upload` | ✅ | 上传图片，返回图片 URL |
| GET | `/api/me` | ❌ | 查询当前登录态 `{ authed, username }` |
| POST | `/api/login` | ❌ | 账号密码登录，下发 Cookie（小程序不用） |
| POST | `/api/logout` | ❌ | 清除登录 Cookie |
| POST | `/api/agent/chat` | ❌ | AI 对话（SSE 流式，`messages` 数组） |

> 建议：展示数据优先用 `/api/open/{section}`（支持分页、体积小、不会一次拉全站），
> 新增/修改用单条 `POST/PUT`，**避免用 `PUT /api/content` 全量覆盖**（并发时容易覆盖掉别人的改动）。

---

## 4. 接口详情

### 4.1 GET `/api/open` — 接口索引 / 数据字典

返回所有模块的元信息（字段名、含义、必填项、当前条数），小程序可用它动态生成表单或列表。

**响应示例（节选）**
```json
{
  "ok": true,
  "version": "v1",
  "baseUrl": "/api/open",
  "auth": { "read": "公开，无需认证", "write": "请求头 X-Admin-User / X-Admin-Pass，或查询参数 ?user=&pass=" },
  "commonQuery": {
    "order": "asc | desc（默认 desc，最新在前）",
    "q": "关键词搜索（匹配条目所有字符串字段）",
    "page": "页码，默认 1",
    "pageSize": "每页条数，默认 20，最大 200"
  },
  "sections": [
    {
      "key": "quotes",
      "label": "我的思考",
      "description": "思考/语录短句",
      "kind": "array",
      "count": 146,
      "orderField": "id",
      "required": ["text"],
      "fields": { "id": "唯一 ID", "text": "思考内容", "author": "时间标注/出处，如 2026年8月" },
      "endpoints": { "list": "/api/open/quotes", "detail": "/api/open/quotes/{id}" }
    }
  ]
}
```

---

### 4.2 GET `/api/open/{section}` — 模块列表

**Query 参数**

| 参数 | 默认 | 说明 |
|------|------|------|
| `page` | `1` | 页码 |
| `pageSize` | `20` | 每页条数，最大 `200` |
| `order` | `desc` | `desc` 最新在前；`asc` 最早在前。有 `date` 的模块按日期排，其余按 `id` 排 |
| `q` | — | 关键词，模糊匹配条目所有字符串/数组字段 |

**请求示例**
```
GET https://www.luliming.xyz/api/open/quotes?page=1&pageSize=20&order=desc
```

**响应示例**
```json
{
  "ok": true,
  "section": "quotes",
  "label": "我的思考",
  "kind": "array",
  "total": 146,
  "page": 1,
  "pageSize": 20,
  "hasMore": true,
  "order": "desc",
  "items": [
    { "id": "t_001", "text": "代码是写给人看的……", "author": "2026年" }
  ]
}
```

> **单例对象模块**（`hero`、`about`）不走分页，返回 `{ ok, section, kind: "object", data: {...} }`，没有 `total / page / items` 字段。
> `about` 的完整响应示例见 [4.10](#410-get-about--关于我数据)。

---

### 4.3 GET `/api/open/{section}/{id}` — 单条详情

```
GET https://www.luliming.xyz/api/open/works/w1
```
```json
{ "ok": true, "section": "works", "data": { "id": "w1", "slug": "building-cyberpunk-ui", "title": "...", "content": "..." } }
```
未找到：`404 { "ok": false, "error": "not found", "id": "w1" }`

---

### 4.4 POST `/api/open/{section}` — 新增一条

**请求头**：`Content-Type: application/json` + 认证头
**Body**：该模块的字段对象，`id` 可不传（服务端自动生成 `{prefix}_{时间戳}_{随机}`，如 `sw_1787..._a1b2c3`）。

| 模块 | 必填字段 |
|------|----------|
| `poems` | `title`, `content` |
| `photos` | `src` |
| `stats` | `label`, `value` |
| `skills` | `name`, `level` |
| `myskills` | `name`, `url` |
| `quotes` | `text` |
| `works` | `title`, `slug` |
| `videos` | `title` |
| `albums` | `name` |
| `softwares` | `name` |
| `socialMedia` | `name` |

**请求示例**
```json
POST /api/open/softwares
{
  "name": "我的小程序",
  "image": "https://www.luliming.xyz/uploads/xxx.png",
  "description": "一个演示作品",
  "url": "https://example.com"
}
```

**响应** `201`
```json
{ "ok": true, "section": "softwares", "data": { "id": "sw_1787..._a1b2c3", "name": "我的小程序", "...": "..." } }
```

**错误**
- `400` 缺必填字段：`{ "ok": false, "error": "missing required fields: title, slug", "required": [...] }`
- `400` id 重复：`{ "ok": false, "error": "id already exists: xxx" }`
- `401` 认证失败 / `404` 未知模块 / `405` hero 不支持新增

---

### 4.5 PUT `/api/open/{section}/{id}` — 局部更新

只更新传入的字段，其余保持不变；`id` 不可修改（`patch` 中的 `id` 会被忽略）。

> **对象模块（`hero` / `about`）不需要 `{id}`**：直接 `PUT /api/open/about` 传要修改的字段即可，效果同为合并。详见 [4.10](#410-get-about--关于我数据)。

```json
PUT /api/open/softwares/sw_xxx
{ "description": "更新后的简介" }
```
```json
{ "ok": true, "section": "softwares", "data": { "id": "sw_xxx", "name": "...", "description": "更新后的简介" } }
```

---

### 4.6 DELETE `/api/open/{section}/{id}` — 删除单条

```
DELETE /api/open/quotes/t_001
```
```json
{ "ok": true, "section": "quotes", "deleted": "t_001" }
```
> 删除不可恢复，请前端二次确认。`hero` 不支持删除（`405`）。

---

### 4.7 PUT `/api/open/{section}` — 整块替换 / 字段合并

行为按模块类型区分：

| 模块类型 | 适用 section | 行为 |
|----------|--------------|------|
| `array` 数组模块 | `poems` `photos` `stats` `skills` `myskills` `quotes` `works` `videos` `albums` `softwares` `socialMedia` | **整块替换**，会覆盖原有全部条目（慎用） |
| `object` 单例模块 | `hero` `about` | **字段合并**，只更新传入的字段，其余保持不变（安全，推荐） |

数组模块示例（Body 可直接传数组，也可传 `{ "data": [...] }`）：
```json
PUT /api/open/stats
[ { "id": "s1", "label": "文章", "value": 42, "suffix": "篇", "color": "cyber-blue" } ]
```
```json
{ "ok": true, "section": "stats", "count": 1, "mode": "replaced" }
```

对象模块示例（只改职位，姓名/简介/技能树等均保持不变）：
```json
PUT /api/open/about
{ "role": "高级项目经理 / 研发效能负责人" }
```
```json
{
  "ok": true,
  "section": "about",
  "count": 1,
  "mode": "merged",
  "data": { "name": "鲁力铭", "role": "高级项目经理 / 研发效能负责人", "...": "其余字段原样保留" }
}
```

> `mode` 字段标明本次是 `merged`（合并）还是 `replaced`（替换），对象模块还会在 `data` 中回传合并后的完整对象，便于客户端直接更新本地状态。
> ⚠️ 更新数组类字段（`socialLinks` / `skillTree` / `timeline`）时需传**完整数组**，合并是按顶层字段覆盖，不会逐条追加。

---

### 4.8 POST `/api/upload` — 上传图片

`multipart/form-data`，字段名 `file`。支持 `jpg/png/webp/gif/svg`，最大 **8MB**。

```bash
curl -X POST https://www.luliming.xyz/api/upload \
  -H 'X-Admin-User: luli' -H 'X-Admin-Pass: luli116574' \
  -F 'file=@/path/to/qrcode.png'
```

**响应**
```json
{
  "ok": true,
  "url": "/uploads/1787200000000_a1b2c3.png",
  "absoluteUrl": "https://www.luliming.xyz/uploads/1787200000000_a1b2c3.png",
  "size": 23456,
  "type": "image/png"
}
```
- `url` 相对路径，供 Web 端使用
- `absoluteUrl` **完整地址，小程序请直接用这个**（`<image src>` 或存入 `image` / `cover` / `qr` / `src` 字段）

---

### 4.9 GET `/api/content` — 全量数据（兼容旧接口）

一次性返回完整站点 JSON，包含全部 13 个模块。适合首次全量同步，不适合频繁调用。

```json
{
  "hero": { "title": "鲁力铭", "subtitle": "...", "avatarText": "鲁", "avatarUrl": "/uploads/xxx.jpg" },
  "poems": [], "photos": [], "stats": [], "skills": [], "myskills": [],
  "quotes": [], "works": [], "videos": [], "albums": [], "softwares": [], "socialMedia": [],
  "about": { "name": "...", "role": "...", "bio": "...", "avatar": "...", "socialLinks": [], "skillTree": [], "timeline": [] }
}
```

`PUT /api/content` 用完整 JSON 覆盖全站（需认证），**并发有覆盖风险，小程序不建议用**。

---

### 4.10 GET / PUT `about` — 关于我数据

`/about` 页面的全部展示内容都可通过开放接口读写，包括个人资料、社交链接、技能树、履历时间线。

**读取（公开）**
```
GET https://www.luliming.xyz/api/open/about
```

**响应示例**
```json
{
  "ok": true,
  "section": "about",
  "label": "关于我",
  "kind": "object",
  "data": {
    "name": "鲁力铭",
    "role": "互联网高级项目经理",
    "bio": "本人拥有 11 年工作经验（4 年研发 + 7 年项目管理）……",
    "avatar": "/images/avatar.jpg",
    "socialLinks": [
      { "id": "as1", "name": "GitHub", "url": "https://github.com", "icon": "⟨/⟩" },
      { "id": "as2", "name": "Bilibili", "url": "https://space.bilibili.com/675642138", "icon": "▶" },
      { "id": "as3", "name": "微博", "url": "https://weibo.com", "icon": "W" },
      { "id": "as4", "name": "Email", "url": "mailto:635003514@qq.com", "icon": "✉" }
    ],
    "skillTree": [
      { "id": "sk1", "name": "PMP", "certificate": "/uploads/pmp-cert.jpg" },
      { "id": "sk2", "name": "ACP", "certificate": "" },
      { "id": "sk3", "name": "NPDP", "certificate": "" }
    ],
    "timeline": [
      { "id": "at1", "year": "2015", "title": "计算机本科毕业", "desc": "桂林电子科技大学 · 计算机科学与技术" },
      { "id": "at2", "year": "2025", "title": "高级项目经理", "desc": "腾讯科技 · CSIG 研发效能提升" }
    ]
  }
}
```

**字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 姓名 |
| `role` | string | 职位 / 头衔 |
| `bio` | string | 个人简介（支持换行） |
| `avatar` | string | 头像图片 URL，建议用 `/api/upload` 返回的 `absoluteUrl` |
| `socialLinks` | `{ id, name, url, icon }[]` | 资料卡下方的图标链接；`icon` 为按钮上显示的短文本/符号 |
| `skillTree` | `{ id, name, certificate }[]` | SKILL TREE 标签数组，按数组顺序展示；`certificate` 为证书图片 URL，非空时前台点击标签可查看大图。兼容历史 `string[]`，读取时自动升级为新结构 |
| `timeline` | `{ id, year, title, desc }[]` | TIMELINE 履历，按数组顺序展示（左右交替布局） |

**更新（需认证，字段合并）**
```bash
curl -X PUT https://www.luliming.xyz/api/open/about \
  -H 'Content-Type: application/json' \
  -H 'X-Admin-User: luli' -H 'X-Admin-Pass: luli116574' \
  -d '{ "bio": "更新后的个人简介" }'
```
```json
{ "ok": true, "section": "about", "count": 1, "mode": "merged", "data": { "...": "完整对象" } }
```

**更新整个数组字段**（如替换技能树，需传完整数组）
```bash
curl -X PUT https://www.luliming.xyz/api/open/about \
  -H 'Content-Type: application/json' \
  -H 'X-Admin-User: luli' -H 'X-Admin-Pass: luli116574' \
  -d '{ "skillTree": [
    {"id":"sk1","name":"PMP","certificate":"/uploads/pmp-cert.jpg"},
    {"id":"sk2","name":"敏捷管理","certificate":""}
  ] }'
```
> 证书图片先用 `POST /api/upload` 上传，把返回的 `url`（站内路径）或 `absoluteUrl` 填入 `certificate`；留空表示无证书。仍兼容历史 `string[]`，读取时自动升级为 `{ id, name, certificate }`。

**约束**
- `about` 是**单例对象**，不支持 `POST` 新增、`DELETE` 删除（均返回 `405`）。`/api/open/about/{id}` 形式会**忽略 id**、直接读写整个对象，不推荐使用；请统一用 `/api/open/about`。
- 更新后 Web 端 `/about` 页面刷新即生效（接口 `no-store`，无需重新部署）。
- 嵌套数组按整体覆盖，`id` 由客户端自行保证唯一；新增条目建议用 `as{时间戳}` / `at{时间戳}` / `sk{时间戳}` 之类前缀。
- `skillTree` 每项可关联一张证书图片：Web 端 `/about` 点击带 📜 标记的标签可查看大图；小程序读取 `certificate` 字段自行展示。

---

## 5. 数据模块与字段字典

| section | 名称 | 条数(示例) | 排序字段 | 说明 |
|---------|------|-----------|----------|------|
| `hero` | 首页信息 | 1（对象） | — | 单例对象，只支持 GET/PUT |
| `poems` | 诗词作品 | 22 | `date` | 诗词全集 |
| `photos` | 首页照片 | 3 | `id` | 首页相框/轮播 |
| `stats` | 统计数字 | 4 | `id` | 首页统计卡片 |
| `skills` | 技能雷达 | 6 | `id` | 雷达图熟练度 |
| `myskills` | 技能作品 | 10 | `id` | 技能条目 |
| `quotes` | 我的思考 | 146 | `id` | 思考/语录 |
| `works` | 文章作品 | 6 | `date` | 博客文章 |
| `videos` | 视频作品 | 6 | `date` | 视频条目 |
| `albums` | 摄影相册 | 4 | `id` | 含 photos 子数组 |
| `softwares` | 软件作品 | 12 | `id` | 软件/项目卡片 |
| `socialMedia` | 自媒体平台 | 5 | `id` | 二维码平台 |
| `about` | 关于我 | 1（对象） | — | 单例对象，只支持 GET/PUT；含社交链接/技能树/履历 |

**字段明细**

| 模块 | 字段 |
|------|------|
| `hero` | `title` `subtitle` `avatarText` `avatarUrl` |
| `poems` | `id` `title` `author` `dynasty` `date` `content` |
| `photos` | `id` `src` `title` `desc` |
| `stats` | `id` `label` `value`(number) `suffix` `color` |
| `skills` | `id` `name` `level`(0-100 number) |
| `myskills` | `id` `name` `url` `description?` |
| `quotes` | `id` `text` `author` |
| `works` | `id` `slug` `title` `excerpt` `date` `category` `tags`(string[]) `readTime` `cover` `content` |
| `videos` | `id` `title` `category` `duration` `cover` `views` `date` `src` |
| `albums` | `id` `name` `cover` `count`(number) `photos`(`[{id,src,title}]`) |
| `softwares` | `id` `name` `image` `description` `url` |
| `socialMedia` | `id` `name` `icon` `desc` `qr` `color` |
| `about` | `name` `role` `bio` `avatar` `socialLinks`(`[{id,name,url,icon}]`) `skillTree`(`[{id,name,certificate}]`，兼容 string[]) `timeline`(`[{id,year,title,desc}]`) |

> `poems` 实际数据含 `dynasty`（朝代）字段，属于扩展字段；接口不限制额外字段，可透传存储。
> 图片类字段（`src` / `image` / `cover` / `qr` / `avatarUrl` / `icon`）建议填 `absoluteUrl` 完整地址，小程序才能直接显示。

---

## 6. 小程序 wx.request 示例

### 6.1 统一封装

```js
const BASE = 'https://www.luliming.xyz';
const AUTH = { 'X-Admin-User': 'luli', 'X-Admin-Pass': 'luli116574' };

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
```

### 6.2 读取数据（列表 + 分页 + 下拉加载）

```js
// 第一页，最新在前
const res = await request('/api/open/quotes?page=1&pageSize=20&order=desc');
// res.items 数据数组；res.hasMore 为 true 时 page+1 继续加载

// 搜索
const found = await request('/api/open/works?q=Next.js');

// 单条详情
const detail = await request('/api/open/works/w1');

// 首页信息
const hero = await request('/api/open/hero');

// 关于我（单例对象，直接取 res.data）
const aboutRes = await request('/api/open/about');
const { name, role, bio, avatar, socialLinks, skillTree, timeline } = aboutRes.data;

// 数据字典（所有模块和字段）
const dict = await request('/api/open');
```

### 6.3 新增 / 修改 / 删除（需认证）

```js
// 新增一条思考
const added = await request('/api/open/quotes', {
  method: 'POST',
  auth: true,
  data: { text: '今天的一点想法', author: '2026年11月' },
});

// 局部修改（只传要改的字段）
await request(`/api/open/quotes/${added.data.id}`, {
  method: 'PUT',
  auth: true,
  data: { text: '修改后内容' },
});

// 删除
await request(`/api/open/quotes/${added.data.id}`, {
  method: 'DELETE',
  auth: true,
});

// 更新「关于我」（对象模块：直接 PUT，字段合并，其余字段保持不变）
await request('/api/open/about', {
  method: 'PUT',
  auth: true,
  data: { role: '高级项目经理 / 研发效能负责人' },
});

// 替换整个技能树（数组字段需传完整数组）
await request('/api/open/about', {
  method: 'PUT',
  auth: true,
  data: { skillTree: [
    { id: 'sk1', name: 'PMP', certificate: '' },
    { id: 'sk2', name: '敏捷管理', certificate: '/uploads/agile-cert.jpg' },
  ] },
});
```

### 6.4 上传图片（wx.uploadFile）

```js
function uploadImage(filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE + '/api/upload',
      filePath,
      name: 'file',
      header: { ...AUTH },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.ok) resolve(data.absoluteUrl); // 完整 URL，可直接存入字段
        else reject(data);
      },
      fail: reject,
    });
  });
}

// 选图 → 上传 → 写入软件作品
wx.chooseMedia({
  count: 1,
  mediaType: ['image'],
  success: async (r) => {
    const imageUrl = await uploadImage(r.tempFiles[0].tempFilePath);
    await request('/api/open/softwares', {
      method: 'POST',
      auth: true,
      data: { name: '我的小程序', image: imageUrl, description: '简介', url: 'https://example.com' },
    });
    wx.showToast({ title: '发布成功' });
  },
});
```

---

## 7. 错误码与统一响应

| HTTP | 含义 | 响应体 |
|------|------|--------|
| 200 | 成功（GET/PUT/DELETE） | `{ "ok": true, ... }` |
| 201 | 创建成功（POST） | `{ "ok": true, "data": {...} }` |
| 204 | CORS 预检 OPTIONS | 空 |
| 400 | 参数/JSON 错误、缺必填、id 重复 | `{ "ok": false, "error": "..." }` |
| 401 | 未认证或凭据错误 | `{ "ok": false, "error": "unauthorized" }` |
| 404 | 模块或条目不存在 | `{ "ok": false, "error": "..." }` |
| 405 | 该模块不支持此操作（如 hero 新增/删除） | `{ "ok": false, "error": "..." }` |
| 413 | 上传文件超过 8MB | `{ "error": "file too large..." }` |
| 415 | 上传文件类型不支持 | `{ "error": "unsupported type..." }` |

---

## 8. 注意事项

1. **写入串行化**：服务端对写操作做了队列串行化，避免并发互相覆盖；但小程序仍建议「先读后改」，不要用全量 `PUT /api/content`。
2. **凭据安全**：管理员密码具备全站读写权限，请仅放在个人小程序本地配置，勿提交到公开仓库、勿下发给其他用户。
3. **实时生效**：接口 `Cache-Control: no-store`，写入后 Web 站点刷新即可看到；无需重新部署。
4. **小程序审核**：个人主体小程序若含「用户发布内容」能力可能受限，建议仅做只读展示，写入能力留在管理员端。
5. **图片域名**：站点数据中有 `images.unsplash.com` / `picsum.photos` 的示例占位图，若小程序要显示，需一并配置为合法域名。
6. **HTTPS**：生产环境强制 HTTPS，请勿使用 `http://`。
7. **对象模块 vs 数组模块**：`hero` / `about` 是单例对象，用 `PUT /api/open/{section}` 做**字段合并**（无 `{id}` 路径）；其余模块是数组，`PUT` 不带 id 时是**整块替换**，务必先 GET 再改。响应中的 `mode` 可用来区分 `merged` / `replaced`。
8. **「关于我」嵌套数组**：`socialLinks` / `skillTree` / `timeline` 按整体覆盖，不会逐条追加；新增履历请传完整 `timeline` 数组。
