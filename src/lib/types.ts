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

// 「关于我」页面
export interface AboutSocialLink {
  id: string;
  name: string;
  url: string;
  icon: string; // 按钮上显示的短文本/符号
}

export interface AboutTimelineItem {
  id: string;
  year: string;
  title: string;
  desc: string;
}

export interface AboutSkill {
  id: string;
  name: string; // 技能 / 证书名称
  certificate: string; // 证书图片 URL，空字符串表示未上传
}

export interface AboutContent {
  name: string; // 姓名
  role: string; // 职位
  bio: string; // 个人简介
  avatar: string; // 头像图片 URL
  socialLinks: AboutSocialLink[];
  skillTree: AboutSkill[]; // SKILL TREE 标签（每项可单独编辑并关联证书图片）
  timeline: AboutTimelineItem[]; // TIMELINE 履历
}

/** 小程序里的单个工具；enabled=false 时小程序端隐藏 */
export interface MiniProgramTool {
  id: string;
  name: string; // 工具名，如「工作日计算器」
  desc: string; // 工具简介
  icon: string; // emoji / 短字符图标
  badge?: string; // 角标，如「原生计算」
  route?: string; // 小程序页面路径（可选）
  enabled: boolean;
}

/** 小程序工具分组；分组也可整体隐藏 */
export interface MiniProgramToolGroup {
  id: string;
  name: string; // 分组名，如 WORK
  subtitle: string; // 如「工作 · 效率」
  color: string; // 主题色 hex
  enabled: boolean;
  tools: MiniProgramTool[];
}

/** 小程序工具配置（单例对象） */
export interface MiniProgramToolsConfig {
  title: string; // 列表标题，如 TOOL LIST
  enabled: boolean; // 总开关：false 时小程序不展示任何工具
  groups: MiniProgramToolGroup[];
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
  about: AboutContent; // 「关于我」页面（管理员可编辑）
  miniProgramTools: MiniProgramToolsConfig; // 小程序工具显示 / 隐藏配置
}
