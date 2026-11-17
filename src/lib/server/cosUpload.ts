import "server-only";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";

const COS_PYTHON =
  process.env.COS_PYTHON || "/opt/experience/backend/.venv/bin/python";
const COS_TOOL = process.env.COS_TOOL || "/opt/luliming-blog/cos/cos_tool.py";
const TIMEOUT_MS = 60_000;
const MAX_OUTPUT = 64 * 1024;

interface CosResult {
  ok?: boolean;
  url?: string;
  key?: string;
  size?: number;
}

/**
 * 调用服务器本地的 COS 工具。凭据只由 Python 侧从 .env 读取，Node 不接触密钥；
 * 文件字节通过 stdin 传给子进程，服务器磁盘不产生任何副本。
 * 使用 spawn + 参数数组（不走 shell），避免命令注入。
 */
function runCosTool(args: string[], input?: Buffer): Promise<CosResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(COS_PYTHON, [COS_TOOL, ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: TIMEOUT_MS,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      if (stdout.length < MAX_OUTPUT) stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      if (stderr.length < MAX_OUTPUT) stderr += chunk;
    });
    // 子进程提前退出时 stdin 可能 EPIPE，不能让它变成未捕获异常
    child.stdin.on("error", () => undefined);
    child.on("error", (err) =>
      reject(new Error(`COS tool spawn failed: ${err.message}`))
    );
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `COS tool exited ${code}: ${stderr.trim().slice(0, 300) || "no stderr"}`
          )
        );
        return;
      }
      const lines = stdout.trim().split("\n").filter(Boolean);
      try {
        resolve(JSON.parse(lines[lines.length - 1] ?? "{}") as CosResult);
      } catch {
        reject(new Error("COS tool returned invalid JSON"));
      }
    });
    child.stdin.end(input);
  });
}

/** 服务端生成对象名；绝不采用客户端传来的文件名，避免路径穿越与类型混淆。 */
export function makeObjectName(ext: string): string {
  return `${Date.now()}_${randomBytes(8).toString("hex")}${ext}`;
}

/** 把上传字节直接写入 COS，返回公网绝对 URL；失败时抛错（不降级写本地盘）。 */
export async function putUploadToCos(
  name: string,
  buf: Buffer
): Promise<string> {
  if (!/^[A-Za-z0-9._-]{1,128}$/.test(name)) {
    throw new Error("invalid object name");
  }
  const out = await runCosTool(["put", name], buf);
  if (out.ok !== true || typeof out.url !== "string" || !out.url.startsWith("https://")) {
    throw new Error("COS upload rejected the object");
  }
  return out.url;
}

/** 删除本站 COS 上的上传对象；Python 侧会校验 URL 属于 personalblog/uploads/。 */
export async function deleteUploadFromCos(url: string): Promise<void> {
  const out = await runCosTool(["delete", url]);
  if (out.ok !== true) throw new Error("COS delete rejected the object");
}
