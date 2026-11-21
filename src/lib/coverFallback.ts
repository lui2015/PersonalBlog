import type { SyntheticEvent } from "react";
import { ARTICLE_COVER_FALLBACK } from "./siteAssets";

/** 文章默认配图：站内静态资源，无外链依赖 */
export { ARTICLE_COVER_FALLBACK } from "./siteAssets";

/** 取文章封面；未配置（空字符串 / 空白）时使用默认配图 */
export function articleCover(cover?: string | null): string {
  return cover && cover.trim() ? cover : ARTICLE_COVER_FALLBACK;
}

/** 外链失效 / 地址错误导致加载失败时回退到默认配图，避免破图与布局塌陷 */
export function handleArticleCoverError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.dataset.fallback === "1") return;
  img.dataset.fallback = "1";
  img.src = ARTICLE_COVER_FALLBACK;
}
