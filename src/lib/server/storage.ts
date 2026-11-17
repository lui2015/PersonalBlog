import "server-only";
import {
  deleteUploadFromCos,
  makeObjectName,
  putUploadToCos,
} from "./cosUpload";

/**
 * 文件存储：只写腾讯云 COS，不在 Lighthouse 磁盘上保留任何上传副本。
 * save() 返回 COS 绝对 URL；delete() 删除对应 COS 对象。
 */
export interface FileStorage {
  save(buf: Buffer, ext: string): Promise<string>;
  delete(publicUrl: string): Promise<void>;
}

class CosStorage implements FileStorage {
  async save(buf: Buffer, ext: string): Promise<string> {
    return putUploadToCos(makeObjectName(sanitizeExt(ext)), buf);
  }

  async delete(publicUrl: string): Promise<void> {
    if (!publicUrl.startsWith("https://")) return;
    await deleteUploadFromCos(publicUrl);
  }
}

function sanitizeExt(ext: string): string {
  if (!ext) return "";
  const e = ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
  if (!e.startsWith(".")) return `.${e}`;
  return e;
}

export const storage: FileStorage = new CosStorage();
