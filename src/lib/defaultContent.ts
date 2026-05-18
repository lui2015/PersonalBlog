import type { SiteContent } from "./types";

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    title: "鲁力铭",
    subtitle: "大鹏一日同风起，扶摇直上九万里",
    avatarText: "鲁",
    avatarUrl: "/images/avatar.jpg",
  },
  poems: [
    {
      id: "p1",
      title: "静夜思",
      author: "李白",
      dynasty: "唐",
      content: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。",
    },
    {
      id: "p2",
      title: "登鹳雀楼",
      author: "王之涣",
      dynasty: "唐",
      content: "白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。",
    },
    {
      id: "p3",
      title: "春晓",
      author: "孟浩然",
      dynasty: "唐",
      content: "春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。",
    },
    {
      id: "p4",
      title: "望庐山瀑布",
      author: "李白",
      dynasty: "唐",
      content:
        "日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。",
    },
  ],
  photos: [
    {
      id: "ph1",
      src: "https://picsum.photos/seed/cyber1/600/400",
      title: "城市夜景",
      desc: "霓虹灯下的未来都市",
    },
    {
      id: "ph2",
      src: "https://picsum.photos/seed/cyber2/600/400",
      title: "星空银河",
      desc: "仰望浩瀚宇宙",
    },
    {
      id: "ph3",
      src: "https://picsum.photos/seed/cyber3/600/400",
      title: "科技之光",
      desc: "代码构建的数字世界",
    },
  ],
  stats: [
    { id: "s1", label: "文章", value: 42, suffix: "篇", color: "cyber-blue" },
    { id: "s2", label: "视频", value: 18, suffix: "个", color: "cyber-purple" },
    { id: "s3", label: "相册", value: 7, suffix: "组", color: "cyber-pink" },
    { id: "s4", label: "诗集", value: 4, suffix: "首", color: "cyber-green" },
  ],
  skills: [
    { id: "sk1", name: "React/Next.js", level: 90 },
    { id: "sk2", name: "TypeScript", level: 85 },
    { id: "sk3", name: "Node.js", level: 80 },
    { id: "sk4", name: "Python", level: 75 },
    { id: "sk5", name: "UI/UX Design", level: 70 },
    { id: "sk6", name: "DevOps", level: 65 },
  ],
  quotes: [
    {
      id: "q1",
      text: "代码是写给人看的，只是顺便能在机器上运行。",
      author: "Harold Abelson",
    },
    { id: "q2", text: "简单是可靠的先决条件。", author: "Edsger Dijkstra" },
    {
      id: "q3",
      text: "任何足够先进的技术都和魔法无异。",
      author: "Arthur C. Clarke",
    },
    { id: "q4", text: "最好的代码是没有代码。", author: "Jeff Atwood" },
    {
      id: "q5",
      text: "We are all in the gutter, but some of us are looking at the stars.",
      author: "Oscar Wilde",
    },
  ],
  works: [
    {
      id: "w1",
      slug: "building-cyberpunk-ui",
      title: "打造赛博朋克风格 UI 设计系统",
      excerpt:
        "探索如何使用 CSS 动画和现代前端技术实现令人惊叹的赛博朋克视觉效果，包括霓虹发光、Glitch 动画、粒子系统等。",
      date: "2026-05-01",
      category: "技术",
      tags: ["CSS", "动画", "设计"],
      readTime: "8 min",
      cover: "https://picsum.photos/seed/post1/800/400",
      content: `## 引言

在当今的 Web 开发中，视觉设计越来越受到重视。赛博朋克风格以其独特的霓虹色彩、未来感界面和沉浸式动画效果，成为了很多开发者追捧的设计方向。

## 核心技术

### 1. CSS 霓虹发光效果

使用 text-shadow 和 box-shadow 可以轻松实现霓虹发光效果。

### 2. Glitch 故障效果

通过 CSS 动画和 clip-path 实现经典的故障艺术效果。

### 3. 粒子背景系统

利用 Canvas API 创建动态粒子网络，营造科技感氛围。

## 设计原则

1. 暗色为主：深邃的黑色/深蓝色背景
2. 霓虹强调：关键元素使用高饱和度的发光色
3. 动态交互：鼠标悬停、滚动触发的动画反馈
4. 层次分明：通过光影和模糊度区分前景和背景

## 总结

赛博朋克 UI 设计不仅仅是视觉上的酷炫，更是一种沉浸式的用户体验设计。`,
    },
    {
      id: "w2",
      slug: "nextjs-performance",
      title: "Next.js 性能优化实战指南",
      excerpt:
        "从 SSR 到 ISR，深入理解 Next.js 渲染策略，掌握图片优化、代码分割、缓存策略等核心技巧。",
      date: "2026-04-25",
      category: "技术",
      tags: ["Next.js", "性能", "SSR"],
      readTime: "12 min",
      cover: "https://picsum.photos/seed/post2/800/400",
      content: `## 渲染策略

Next.js 提供了多种渲染策略：SSR、SSG、ISR、CSR。合理选择能显著提升性能。

## 图片优化

使用 next/image 自动完成懒加载、响应式与现代格式转换。

## 代码分割

利用动态 import 与路由级分割，按需加载代码。`,
    },
    {
      id: "w3",
      slug: "creative-coding",
      title: "创意编程：用代码绘制艺术",
      excerpt:
        "利用 Canvas 和 WebGL 创造令人着迷的生成艺术作品，探索算法之美。",
      date: "2026-04-18",
      category: "创意",
      tags: ["Canvas", "WebGL", "生成艺术"],
      readTime: "6 min",
      cover: "https://picsum.photos/seed/post3/800/400",
      content: `## 生成艺术

通过算法、随机、噪声函数生成视觉作品。

## Canvas 实战

从粒子系统到分形图案，逐步搭建一个属于自己的视觉宇宙。`,
    },
    {
      id: "w4",
      slug: "life-in-code",
      title: "程序员的日常：代码之外的生活",
      excerpt: "工作与生活的平衡、保持创造力的方法、以及我日常的一些思考和感悟。",
      date: "2026-04-10",
      category: "生活",
      tags: ["生活", "思考"],
      readTime: "5 min",
      cover: "https://picsum.photos/seed/post4/800/400",
      content: `## 平衡

工作之外，给自己留出运动、阅读与发呆的时间。

## 创造力

灵感来自生活的细节，记录它们。`,
    },
    {
      id: "w5",
      slug: "typescript-advanced",
      title: "TypeScript 高级类型体操",
      excerpt:
        "深入理解 TypeScript 条件类型、映射类型、模板字面量类型等高级特性。",
      date: "2026-04-05",
      category: "技术",
      tags: ["TypeScript", "类型系统"],
      readTime: "15 min",
      cover: "https://picsum.photos/seed/post5/800/400",
      content: `## 条件类型

T extends U ? X : Y 是类型系统的开关。

## 映射类型

通过 keyof 和 in 实现类型变换。`,
    },
    {
      id: "w6",
      slug: "random-thoughts",
      title: "关于时间、效率和内卷的思考",
      excerpt: "在信息爆炸的时代，如何找到自己的节奏，避免无意义的焦虑。",
      date: "2026-03-28",
      category: "随笔",
      tags: ["思考", "效率"],
      readTime: "4 min",
      cover: "https://picsum.photos/seed/post6/800/400",
      content: `## 节奏

不是每一件事都值得加速。

## 专注

找到一两件值得花时间的事，长期投入。`,
    },
  ],
};
