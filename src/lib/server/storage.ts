import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { UPLOADS_DIR } from "./paths";

/**
 * 文件存储抽象。当前只有磁盘实现；未来切 COS 只需实现同样的接口。
 */
export interface FileStorage {
  /** 保存上传文件，返回可对外访问的 URL（相对路径，如 /uploads/xxx.jpg） */
  save(buf: Buffer, ext: string): Promise<string>;
  /** 删除一个先前 save 返回的 URL 对应的文件 */
  delete(publicUrl: string): Promise<void>;
}

class DiskStorage implements FileStorage {
  async save(buf: Buffer, ext: string): Promise<string> {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const safeExt = sanitizeExt(ext);
    const name = `${Date.now()}_${randomBytes(6).toString("hex")}${safeExt}`;
    const full = path.join(UPLOADS_DIR, name);
    await fs.writeFile(full, buf);
    return `/uploads/${name}`;
  }

  async delete(publicUrl: string): Promise<void> {
    if (!publicUrl.startsWith("/uploads/")) return;
    const name = path.basename(publicUrl); // 防穿越
    if (!name || name === "." || name === "..") return;
    const full = path.join(UPLOADS_DIR, name);
    try {
      await fs.unlink(full);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "ENOENT"
      ) {
        return;
      }
      throw err;
    }
  }
}

function sanitizeExt(ext: string): string {
  if (!ext) return "";
  const e = ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
  if (!e.startsWith(".")) return `.${e}`;
  return e;
}

export const storage: FileStorage = new DiskStorage();
