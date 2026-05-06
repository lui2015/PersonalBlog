# 个人空间网页 - 产品需求文档（PRD）

> 版本：v0.3 ｜ 最后更新：2026-05-07
>
> 变更记录：
> - v0.3（2026-05-07）：内容存储从 `localStorage` 升级为**服务端持久化**；新增鉴权、上传、内容读写 API；Nginx 直出 `/uploads/`；新增第 12 章「服务端持久化与鉴权」、第 13 章「运维与备份」；同步更新 §10.4 / §10.5 / §11。
> - v0.2（2026-05-06）：新增第 10 章「管理后台实现现状」、第 11 章「部署方案」；同步更新验收标准勾选状态。
> - v0.1：初版需求。

## 1. 项目概述

### 1.1 项目名称
CyberSpace - 赛博朋克风格个人空间

### 1.2 项目定位
一个集个人展示、内容创作、媒体管理于一体的个人空间网站，采用赛博朋克视觉风格，具备强烈的科技感和炫酷动画效果。

### 1.3 目标用户
网站所有者本人，用于对外展示个人信息、作品及生活记录。

### 1.4 技术栈建议
- 前端：React/Next.js + TypeScript + Tailwind CSS + Framer Motion
- 动画引擎：GSAP / Three.js（3D 特效）
- 样式主题：赛博朋克（霓虹色系、暗色背景、光影粒子）

---

## 2. 设计风格规范

### 2.1 视觉基调
| 要素 | 规范 |
|------|------|
| 主色调 | 深黑 (#0a0a0f)、深蓝 (#0d1b2a) |
| 强调色 | 霓虹蓝 (#00f0ff)、霓虹紫 (#bf00ff)、霓虹粉 (#ff0080)、电光绿 (#39ff14) |
| 字体 | 主标题使用科技感字体（如 Orbitron/Rajdhani），正文使用等宽或无衬线字体 |
| 边框 | 发光边框（glow effect）、扫描线纹理 |
| 背景 | 粒子星空/矩阵雨/电路板纹理动态背景 |

### 2.2 动画效果要求
- **全局效果**：页面加载时的赛博启动动画（类似系统引导界面）
- **滚动动画**：模块进入视口时的 glitch 抖动、霓虹闪烁效果
- **鼠标交互**：悬停时元素发光增强、光标拖尾粒子特效
- **转场动画**：页面切换时的数据流/故障风格过渡
- **常驻动画**：背景粒子浮动、文字扫描线滚动、边框呼吸灯效果

---

## 3. 功能模块详细需求

### 3.1 模块一：个人信息与简介

#### 功能描述
展示站长的个人身份信息、职业介绍、技能标签、社交链接等。

#### 具体需求
| 编号 | 需求项 | 描述 | 优先级 |
|------|--------|------|--------|
| P1-01 | 头像展示 | 支持圆形/六边形头像框，带霓虹发光边框动画 | P0 |
| P1-02 | 基本信息 | 姓名、职位/身份、所在地、联系方式 | P0 |
| P1-03 | 个人简介 | 支持富文本，200-500 字自我介绍 | P0 |
| P1-04 | 技能标签 | 标签云/进度条形式展示技能树，带动态加载动画 | P1 |
| P1-05 | 社交链接 | GitHub、微博、B站、邮箱等图标链接，悬浮发光效果 | P1 |
| P1-06 | 状态签名 | 一句话动态签名，支持打字机动画效果 | P2 |

#### 视觉参考
- 头像区域如同全息投影浮动
- 信息卡片采用半透明毛玻璃 + 霓虹边框
- 技能进度条带电流流动动画

---

### 3.2 模块二：博客系统

#### 功能描述
支持发布和展示文章/博客内容，具备分类、标签、搜索等功能。

#### 具体需求
| 编号 | 需求项 | 描述 | 优先级 |
|------|--------|------|--------|
| P2-01 | 文章列表 | 卡片式布局展示文章，含标题、摘要、封面图、发布时间 | P0 |
| P2-02 | 文章详情 | 支持 Markdown 渲染，代码高亮，目录导航 | P0 |
| P2-03 | 分类管理 | 文章按类别归档（技术、生活、随笔等） | P0 |
| P2-04 | 标签系统 | 文章多标签支持，点击标签筛选 | P1 |
| P2-05 | 搜索功能 | 全文搜索，支持标题/内容/标签匹配 | P1 |
| P2-06 | 阅读统计 | 阅读量、预计阅读时间显示 | P2 |
| P2-07 | 评论系统 | 支持访客评论（可集成第三方如 Giscus） | P2 |

#### 视觉参考
- 文章卡片带数据流动边框动画
- 文章详情页顶部有 glitch 标题特效
- 代码块采用终端风格（暗绿字符）

---

### 3.3 模块三：短视频展示

#### 功能描述
展示和播放站长的短视频内容，支持分类浏览。

#### 具体需求
| 编号 | 需求项 | 描述 | 优先级 |
|------|--------|------|--------|
| P3-01 | 视频瀑布流 | 瀑布流/网格布局展示视频封面 | P0 |
| P3-02 | 视频播放器 | 内嵌播放器，支持进度条、全屏、音量控制 | P0 |
| P3-03 | 视频分类 | 按类型分类（Vlog、教程、创意等） | P1 |
| P3-04 | 外链支持 | 支持嵌入 B站/YouTube 等外部平台视频 | P1 |
| P3-05 | 封面悬浮预览 | 鼠标悬停时自动播放前几秒预览 | P2 |

#### 视觉参考
- 视频网格卡片带扫描线叠加效果
- 播放器 UI 采用 HUD 风格（类似科幻电影界面）
- 视频加载时显示数据解码动画

---

### 3.4 模块四：相册功能

#### 功能描述
以精美的方式展示照片集，支持相册分组和大图浏览。

#### 具体需求
| 编号 | 需求项 | 描述 | 优先级 |
|------|--------|------|--------|
| P4-01 | 相册分组 | 支持创建多个相册（旅行、日常、摄影作品等） | P0 |
| P4-02 | 图片网格 | 瀑布流/等高网格展示照片缩略图 | P0 |
| P4-03 | 大图灯箱 | 点击图片弹出大图，支持左右切换、缩放 | P0 |
| P4-04 | 相册封面 | 每个相册可设置封面图 | P1 |
| P4-05 | 图片信息 | 拍摄时间、地点、相机参数（EXIF 信息） | P2 |
| P4-06 | 幻灯片模式 | 自动轮播全屏观看模式 | P2 |

#### 视觉参考
- 相册封面采用全息卡片效果，悬浮时有 3D 翻转
- 灯箱背景为深邃星空粒子
- 图片加载时有扫描线从上到下的解码效果

---

### 3.5 模块五：首页自定义布局系统（核心特色）

#### 功能描述
首页支持模块化、可自定义的页面结构，用户（站长）可自由配置展示哪些模块、以何种布局呈现。

#### 具体需求
| 编号 | 需求项 | 描述 | 优先级 |
|------|--------|------|--------|
| P5-01 | 模块化组件 | 预设多种可选模块（见下方模块清单） | P0 |
| P5-02 | 拖拽排序 | 管理后台支持拖拽调整模块顺序 | P0 |
| P5-03 | 布局选择 | 支持单栏/双栏/三栏/自由网格等布局模式 | P1 |
| P5-04 | 模块开关 | 可启用/禁用任意模块 | P0 |
| P5-05 | 模块配置 | 每个模块可独立配置内容和样式参数 | P1 |
| P5-06 | 实时预览 | 编辑时可实时预览最终效果 | P1 |

#### 预设模块清单

| 模块名称 | 描述 | 视觉风格 |
|----------|------|----------|
| 🎭 诗词模块 | 展示古诗词/名言/个人创作，支持竖排、横排切换 | 赛博水墨融合风，文字带霓虹描边、背景有数字雨与山水剪影叠加 |
| 🖼️ 相框模块 | 精选照片展示框，支持单图/轮播/拼图模式 | 全息投影相框，悬浮 3D 效果，边框有电流流动动画 |
| 📝 最新博客 | 展示最近发布的 N 篇文章摘要 | 数据卡片风格，滚动时有数据流入场动画 |
| 🎬 精选视频 | 首页精选视频轮播或网格 | HUD 界面风格播放窗口 |
| 🏷️ 技能雷达 | 技能掌握程度的雷达图/环形图展示 | 全息雷达扫描动画 |
| 📊 数据面板 | 网站统计数据展示（文章数、访客数等） | 赛博仪表盘，数字翻牌动画 |
| 🎵 音乐播放器 | 嵌入背景音乐播放器 | 频谱可视化，霓虹波形 |
| 💬 一言/随机语录 | 随机展示一句名言或个人想法 | 终端打字机效果 |
| 🌐 友链模块 | 友情链接展示 | 节点连线图风格 |
| ⏰ 时钟/日期 | 赛博风格时钟组件 | 数字翻牌/全息时钟 |

#### 诗词模块详细设计
- 支持手动录入或接入第三方古诗词 API（如今日诗词 API）
- 展示内容：诗名、作者、朝代、正文、赏析（可选）
- 排版模式：竖排古典模式 / 横排现代模式
- 动画效果：文字逐字显现（墨水晕染感 + 霓虹微光）
- 可配置定时轮换或手动切换

#### 相框模块详细设计
- 支持上传 1-9 张照片
- 展示模式：单图大屏 / 双图对比 / 九宫格 / 轮播
- 相框样式可选：赛博霓虹框、全息投影框、故障艺术框
- 支持添加图片标题和描述文字
- 悬浮时照片微微浮起并放大

---

## 4. 页面结构规划

### 4.1 页面地图

```
首页 (/)
├── 导航栏（固定顶部，半透明毛玻璃 + 霓虹下划线）
├── Hero 区域（全屏视觉冲击区，粒子/3D 背景）
├── 自定义模块区域（可配置的模块组合）
└── 页脚（社交链接、版权信息）

关于我 (/about)
├── 个人信息卡片
├── 时间线（经历/里程碑）
└── 技能树

博客 (/blog)
├── 文章列表页
└── 文章详情页 (/blog/:slug)

视频 (/videos)
├── 视频列表/网格
└── 视频播放页

相册 (/gallery)
├── 相册列表
└── 相册详情 (/gallery/:album)

管理后台 (/admin)  [需登录]
├── 内容管理（文章/视频/相册 CRUD）
├── 首页布局编辑器
└── 网站设置
```

### 4.2 导航设计
- 固定顶部导航栏，滚动时背景加深
- 导航项带霓虹下划线指示当前页
- 移动端收缩为汉堡菜单，展开时全屏覆盖 + 故障动画

---

## 5. 非功能需求

### 5.1 性能
| 指标 | 目标 |
|------|------|
| 首屏加载 | ≤ 3s（包含动画启动） |
| LCP | ≤ 2.5s |
| 图片加载 | 懒加载 + WebP 格式优化 |
| 动画帧率 | ≥ 60fps（核心动画） |

### 5.2 响应式
- 完整支持 PC（1920px+）、平板（768-1024px）、手机（375-767px）
- 动画在移动端适当降级以保证流畅性

### 5.3 SEO
- SSR/SSG 支持（Next.js）
- 结构化数据标记
- 自动生成 sitemap

### 5.4 无障碍
- 动画支持 `prefers-reduced-motion` 媒体查询降级
- 图片 alt 文本
- 键盘导航支持

---

## 6. 管理后台需求

### 6.1 内容管理
- 文章：Markdown 编辑器，支持图片上传、草稿/发布状态
- 视频：上传或填入外链，编辑标题/描述/分类
- 相册：创建相册、批量上传图片、编辑图片信息

### 6.2 首页布局编辑器
- 可视化拖拽界面
- 实时预览
- 一键保存/发布布局
- 支持保存多套布局方案（一键切换）

### 6.3 网站设置
- 网站标题、描述、Logo
- 主题色微调
- SEO 设置
- 评论开关

---

## 7. 项目里程碑

| 阶段 | 内容 | 建议周期 |
|------|------|----------|
| Phase 1 | 项目初始化 + 设计系统 + 首页框架 + 全局动画 | 2 周 |
| Phase 2 | 个人信息模块 + 博客系统 | 2 周 |
| Phase 3 | 视频模块 + 相册模块 | 2 周 |
| Phase 4 | 首页自定义布局系统 + 管理后台 | 3 周 |
| Phase 5 | 性能优化 + 响应式适配 + 测试上线 | 1 周 |

---

## 8. 风险与注意事项

1. **动画性能**：大量粒子/3D 动画需注意低端设备兼容，需提供降级方案
2. **内容加载**：视频/图片资源较重，需做好 CDN 加速和懒加载策略
3. **SEO 与动画冲突**：确保核心内容在 SSR 阶段已渲染，动画为增强层
4. **浏览器兼容**：WebGL/CSS 动画需兼容主流浏览器（Chrome、Firefox、Safari、Edge）
5. **管理安全**：后台需有登录鉴权，防止未授权访问

---

## 9. 验收标准

- [x] 首页加载后 1s 内完成赛博启动动画并展示核心内容
- [x] 所有页面在 PC/平板/手机三端显示正常
- [x] 首页模块可通过后台自由增删、排序、配置
- [x] 诗词模块和相框模块在首页正确展示且动画流畅
- [x] 博客文章支持 Markdown 渲染和代码高亮
- [ ] 视频播放功能正常，支持外链嵌入
- [ ] 相册支持大图浏览和相册分组
- [x] 整体视觉风格统一为赛博朋克主题
- [x] 动画效果流畅，无明显卡顿（60fps）
- [x] 管理后台功能完整，操作流畅

---

## 10. 管理后台实现现状（v0.2 新增）

### 10.1 已上线模块
路径 `/admin`，登录后通过 `AdminPanel` 统一入口，左侧导航进入各内容编辑页：

| 路由 | 功能 | 状态 |
|------|------|------|
| `/admin/login` | 简易口令登录（前端校验，存储于 `AuthContext`） | ✅ |
| `/admin/hero` | 首页 Hero 区域（标题、副标题、头像）编辑 | ✅ |
| `/admin/poems` | 诗词模块 CRUD（题目/作者/朝代/正文） | ✅ |
| `/admin/photos` | 相框模块 CRUD（图片 URL/标题/描述） | ✅ |
| `/admin/stats` | 数据面板 CRUD（标签/数值/后缀/配色） | ✅ |
| `/admin/skills` | 技能雷达 CRUD（名称/等级 0-100） | ✅ |
| `/admin/quotes` | 一言/语录 CRUD | ✅ |
| `/admin/works` | 博客文章 CRUD（slug/标题/摘要/分类/标签/封面/Markdown 正文） | ✅ |

### 10.2 通用编辑能力
- `ItemListEditor`：列表型内容的统一新增/排序/删除组件
- `ImageUploader`：图片选择 → **POST `/api/upload`** → 服务端写入磁盘并返回 `/uploads/xxx` URL（v0.3 起；旧版为 Base64 落 localStorage）
- 所有内容编辑实时反映到首页/博客页（基于 `ContentContext`，v0.3 起从 `/api/content` 拉取并 PUT 回写）

### 10.3 数据模型（详见 `src/lib/types.ts`）
```
SiteContent {
  hero, poems[], photos[], stats[], skills[], quotes[], works[]
}
```

### 10.4 存储方案（v0.3 升级）
**服务端持久化**，内容随服务器一份，访客与编辑者看同一份数据。

| 维度 | 实现 |
|------|------|
| 存储后端 | 抽象 `Storage` 接口（`src/lib/server/storage.ts`），当前实现为本地文件系统 |
| 内容文件 | `${DATA_DIR}/site-content.json`（容器内 `/app/.data/site-content.json`） |
| 上传文件 | `${DATA_DIR}/uploads/<timestamp>_<rand>.<ext>` |
| 持久化 | Docker volume：宿主机 `/opt/luliming-blog/data` → 容器 `/app/.data`；容器重建数据不丢 |
| 默认内容 | 文件不存在时回落 `defaultContent.ts`，首次写入时落盘 |
| 未来切换 | 新增 `Storage` 实现（如 COS/S3）+ 切换 env 即可，业务代码无感 |

⚠️ 历史数据迁移：旧版 `localStorage` 数据需通过后台「**导出 JSON / 导入 JSON**」按钮迁移到服务端。

### 10.5 已知待补需求
- [ ] 视频模块（PRD §3.3）：仅有占位页，未接入数据
- [ ] 相册模块（PRD §3.4）：未上线
- [ ] 评论系统（P2-07）
- [ ] 全文搜索（P2-05）
- [x] ~~内容服务端持久化~~（v0.3 已完成，见 §12）

---

## 11. 部署方案（v0.3 更新）

### 11.1 目标环境
- 腾讯云轻量应用服务器（`ap-guangzhou`，实例 `lhins-gd7emk5l`，公网 `159.75.56.177`）
- 域名：`https://www.luliming.xyz`
- 共享服务器，**必须保证不影响其他已运行服务**

### 11.2 实际架构（v0.3）
```
[公网 443] → Nginx (宿主机)
              ├── /uploads/*  → alias /opt/luliming-blog/data/uploads/  （直出磁盘，不经 Node）
              └── 其余流量    → http://127.0.0.1:3100
                                 └── Docker 容器 luliming-blog (Next.js standalone)
                                       ├── --env-file /opt/luliming-blog/.env
                                       └── -v /opt/luliming-blog/data:/app/.data
```

### 11.3 隔离策略
| 维度 | 设计 |
|------|------|
| 应用端口 | Docker 容器内 Next.js 监听 3000，宿主机绑 `127.0.0.1:3100`（不开公网） |
| 进程管理 | Docker `--restart=unless-stopped`，容器名 `luliming-blog` |
| 项目目录 | 仓库 `/opt/luliming-blog/repo`、数据 `/opt/luliming-blog/data`、备份 `/opt/luliming-blog/backups`、密钥 `/opt/luliming-blog/.env`（chmod 600） |
| Nginx | 仅维护 drop-in 文件 `/etc/nginx/conf.d/luliming.conf`，不动主配置；新增 `location /uploads/` |
| HTTPS | Let's Encrypt（已存在） |
| 安全组 | 开放 `80/tcp`、`443/tcp`，**不**开放 3100 |

### 11.4 部署产物
仓库内提供：
- `Dockerfile`（多阶段构建，alpine + standalone 输出，声明 `VOLUME ["/app/.data"]`）
- `deploy/server-setup.sh`、`deploy/deploy.sh`、`deploy/nginx/luliming.xyz.conf`、`deploy/DEPLOY.md`
- `ecosystem.config.js`：备用 PM2 进程定义

### 11.5 上线检查清单
- [x] DNS：`luliming.xyz` 与 `www.luliming.xyz` 指向服务器
- [x] 安全组：仅开放 80/443
- [x] Nginx 配置不与既有站点重叠
- [x] Let's Encrypt 证书签发并自动续签
- [x] 容器 `--restart=unless-stopped` 配置开机自启
- [x] 健康检查 `curl https://www.luliming.xyz/` 返回 200
- [x] `/api/content` 公开可读、`/api/login` + 私有路由鉴权正确

---

## 12. 服务端持久化与鉴权（v0.3 新增）

### 12.1 API 清单（Next.js Route Handlers）
| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/content` | 公开 | 读取站点内容（首页 SSR/客户端均使用） |
| PUT | `/api/content` | 需登录 | 全量覆盖站点内容 |
| POST | `/api/login` | 公开 | 登录，签发 session cookie |
| POST | `/api/logout` | 需登录 | 清除 session |
| GET | `/api/me` | 公开 | 返回当前登录态（未登录返回 `null`） |
| POST | `/api/upload` | 需登录 | `multipart/form-data` 单文件上传，返回 `{ url: "/uploads/xxx" }` |

源码位置：`src/app/api/*/route.ts`、共用逻辑 `src/lib/server/{auth,content,paths,storage}.ts`。

### 12.2 鉴权设计
| 项 | 实现 |
|----|------|
| 凭证存储 | 用户名明文 + scrypt 密码哈希 (`scrypt$<saltHex>$<hashHex>`) 写入服务器 `/opt/luliming-blog/.env` |
| Session | HMAC-SHA256 自签 cookie，结构 `<payloadBase64Url>.<sigBase64Url>`，载荷含 `{ uid, exp }` |
| Cookie | `httpOnly` + `secure`（HTTPS 下） + `sameSite=lax`，有效期 7 天 |
| 服务端校验 | 每个受保护路由通过 `requireAuth()` 解析并验签 cookie，过期/被改动则 401 |
| 速率限制 | 登录失败计数 + 短时延迟（防暴力破解） |
| 密钥 | `SESSION_SECRET` 48 字节随机，写入 `.env`；轮换会使所有人下线 |

### 12.3 环境变量
| 变量 | 必填 | 示例 | 说明 |
|------|------|------|------|
| `ADMIN_USERNAME` | ✅ | `luli` | 管理员用户名 |
| `ADMIN_PASSWORD_HASH` | ✅ | `scrypt$<hex>$<hex>` | scrypt(password, saltHex, 64) 后拼装 |
| `SESSION_SECRET` | ✅ | 48 字节随机 hex | session HMAC 密钥 |
| `DATA_DIR` | 推荐 | `/app/.data` | 内容/上传根目录，容器内默认 `/app/.data` |
| `PUBLIC_BASE_URL` | 可选 | `https://www.luliming.xyz` | 用于生成绝对 URL |

> 生成密码哈希示例（注意：salt 在 hash 与 verify 必须使用同一形态，本项目统一使用 hex 字符串作为 salt）：
> ```bash
> node -e "const c=require('crypto');const s=c.randomBytes(16).toString('hex');const h=c.scryptSync('YOUR_PWD',s,64).toString('hex');process.stdout.write('scrypt$'+s+'$'+h)"
> ```

### 12.4 上传文件流转
1. 后台 `ImageUploader` 选择文件 → `POST /api/upload`
2. 服务端校验登录 + 文件类型（仅 `image/*`） + 大小上限
3. 写入 `${DATA_DIR}/uploads/<ts>_<rand>.<ext>`，返回 `{ url: "/uploads/<filename>" }`
4. 浏览器请求 `/uploads/xxx` 时，**Nginx 直接 alias 到磁盘**，不经过 Node，CDN 缓存 30 天

### 12.5 安全要点
- ❌ 密码不再硬编码进前端 bundle
- ✅ Session 服务端验签，前端无法伪造
- ✅ `/api/content` 写入受 `requireAuth` 保护
- ✅ `.env` 权限 600，仓库 `.gitignore` 排除所有 `.env*`
- ✅ 上传白名单 `image/*`，文件名重新生成（避免路径穿越/MIME 欺骗）

---

## 13. 运维与备份（v0.3 新增）

### 13.1 数据布局
```
/opt/luliming-blog/
├── repo/                # 代码（git checkout）
├── data/                # 业务数据（Docker volume 挂载）
│   ├── site-content.json
│   └── uploads/
├── backups/             # 自动备份归档
├── .env                 # 凭证 + secret，chmod 600
└── backup.sh            # 备份脚本
```

### 13.2 自动备份
- cron：每天 03:15 执行 `/opt/luliming-blog/backup.sh`
- 产物：`/opt/luliming-blog/backups/luliming-blog-YYYYMMDD-HHMM.tar.gz`，包含 `data/` 全部内容
- 保留：14 天，超过自动清理
- 日志：`/opt/luliming-blog/backup.log`

### 13.3 发布流程（增量更新）
1. 本地 `rsync`（排除 `node_modules`/`.next`/`.git`）到服务器临时 staging 目录
2. `rsync --delete` 进 `repo/`（保留 `Dockerfile`、`.dockerignore`、`public/`）
3. `docker build -t luliming-blog:latest .`
4. `docker stop && docker rm && docker run`（**必须**重建容器，`docker restart` 不会重读 `--env-file`）
5. 烟测：`/api/content`、`/api/login`、`/uploads/*`、首页

### 13.4 容量与单点风险
- 当前磁盘 24G+ 空余，预计可支撑 1-2 年图片增长
- 轻量服务器为单点，建议每月手工下载一次 `backups/` 到本地或异地存储
- 长期演进：图片切 COS / 对象存储（替换 `Storage` 实现即可）

### 13.5 常用排障命令
```bash
# 查看容器
docker ps --filter name=luliming-blog
docker logs --tail=100 luliming-blog
# 重新部署
cd /opt/luliming-blog/repo && docker build -t luliming-blog:latest .
docker stop luliming-blog && docker rm luliming-blog
docker run -d --name luliming-blog --restart=unless-stopped \
  --env-file /opt/luliming-blog/.env \
  -v /opt/luliming-blog/data:/app/.data \
  -p 127.0.0.1:3100:3000 luliming-blog:latest
# 校验密码哈希
docker exec luliming-blog node -e "..."
# Nginx
nginx -t && systemctl reload nginx
```
