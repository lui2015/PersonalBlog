import path from "node:path";

/**
 * 数据根目录。
 * - 生产：通过 DATA_DIR 环境变量传入（Docker 里挂载到 /app/data）
 * - 本地：默认仓库根的 .data/（已加入 .gitignore）
 */
export const DATA_DIR =
  process.env.DATA_DIR && process.env.DATA_DIR.trim().length > 0
    ? process.env.DATA_DIR
    : path.join(process.cwd(), ".data");

export const CONTENT_FILE = path.join(DATA_DIR, "site-content.json");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
