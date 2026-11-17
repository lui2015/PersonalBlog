import "server-only";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const COS_PYTHON =
  process.env.COS_PYTHON || "/opt/experience/backend/.venv/bin/python";
const COS_TOOL = process.env.COS_TOOL || "/opt/luliming-blog/cos/cos_tool.py";

/**
 * 把刚写入本地的上传文件同步到 COS，返回 COS 绝对 URL。
 *
 * 凭据由服务器上的 Python 工具从本地 .env 读取，Node 侧不接触任何密钥；
 * 使用 execFile + 参数数组（不走 shell），且只接受服务端生成的 /uploads/ 文件名。
 * COS 不可用时返回 null，调用方回退到本地 URL，不阻断上传主流程。
 */
export async function syncUploadToCos(localUrl: string): Promise<string | null> {
  if (!/^\/uploads\/[A-Za-z0-9._-]+$/.test(localUrl)) return null;
  try {
    const { stdout } = await execFileAsync(
      COS_PYTHON,
      [COS_TOOL, "upload", localUrl],
      { timeout: 30_000, maxBuffer: 64 * 1024 }
    );
    const lines = stdout.trim().split("\n").filter(Boolean);
    const out = JSON.parse(lines[lines.length - 1] ?? "{}") as { url?: string };
    return typeof out.url === "string" && out.url.startsWith("https://")
      ? out.url
      : null;
  } catch (err) {
    console.error(
      "[cos] sync upload failed, fallback to local:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
