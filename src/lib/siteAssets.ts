/** 站内静态资源路径（前后端与 API 文档共用） */
export const ARTICLE_COVER_FALLBACK = "/images/article-cover.svg";

/** works 模块由接口输出、不落库的只读派生字段 */
export const WORK_DERIVED_FIELDS = [
  "contentHtml",
  "contentFormat",
  "coverUrl",
  "coverIsDefault",
] as const;
