import path from "node:path";

/**
 * 数据根目录：只存放 site-content.json（文字数据）。
 * 上传文件（图片 / HTML / PDF 等）一律存 COS，不写入此目录。
 * - 生产：通过 DATA_DIR 环境变量传入
 * - 本地：默认仓库根的 .data/（已加入 .gitignore）
 */
export const DATA_DIR =
  process.env.DATA_DIR && process.env.DATA_DIR.trim().length > 0
    ? process.env.DATA_DIR
    : path.join(process.cwd(), ".data");

export const CONTENT_FILE = path.join(DATA_DIR, "site-content.json");

/** 管理员上传的 APK 安装包（固定文件名，上传即原子替换） */
export const APK_DIR = path.join(DATA_DIR, "apk");
export const APK_FILE = path.join(APK_DIR, "app-release.apk");
