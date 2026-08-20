// 内容数据模型

export interface Poem {
  id: string;
  title: string;
  author: string;
  date: string; // 创作时间，YYYY-MM-DD 或任意文本
  content: string;
}

export interface Photo {
  id: string;
  src: string;
  title: string;
  desc: string;
}

export interface Stat {
  id: string;
  label: string;
  value: number;
  suffix: string;
  color: string; // tailwind color suffix, e.g. "cyber-blue"
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
}

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export interface Work {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD
  category: string;
  tags: string[];
  readTime: string; // e.g. "8 min"
  cover: string;
  content: string; // markdown
}

export interface Video {
  id: string;
  title: string;
  category: string;
  duration: string;
  cover: string;
  views: string;
  date: string; // YYYY-MM-DD
  src: string; // Bilibili 嵌入地址（留空则展示占位播放器）
}

// 软件作品：卡片展示（名称/图片/简介），点击跳转对应网页
export interface SoftwareWork {
  id: string;
  name: string; // 作品名称
  image: string; // 封面/截图地址
  description: string; // 简介
  url: string; // 点击后跳转的网页地址
}

export interface GalleryPhoto {
  id: string;
  src: string;
  title: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  cover: string;
  count: number;
  photos: GalleryPhoto[];
}

export interface MySkill {
  id: string;
  name: string;
  url: string; // 技能地址 / 链接
  description?: string; // 技能描述（可选）
}

// 自媒体平台
export interface SocialPlatform {
  id: string;
  name: string;
  icon: string; // emoji 图标
  desc: string;
  qr: string; // public/ 下的相对路径
  color: string; // 品牌色 hex
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    avatarText: string; // 占位文字
    avatarUrl: string; // 头像图片 URL（可选）
  };
  poems: Poem[];
  photos: Photo[];
  stats: Stat[];
  skills: Skill[];
  myskills: MySkill[]; // 我的技能（名称 + 地址）
  quotes: Quote[];
  works: Work[];
  videos: Video[];
  albums: GalleryAlbum[];
  softwares: SoftwareWork[];
  socialMedia: SocialPlatform[]; // 自媒体平台（管理员可编辑）
}
