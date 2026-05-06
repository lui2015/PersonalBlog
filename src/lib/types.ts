// 内容数据模型

export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
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
  quotes: Quote[];
  works: Work[];
}
