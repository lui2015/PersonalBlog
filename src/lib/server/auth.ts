import "server-only";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const SCRYPT_KEYLEN = 64;

// ---------------- 密码：scrypt 哈希 ----------------

/** 生成 scrypt 哈希字符串：scrypt$<saltHex>$<hashHex> */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = await scrypt(plain, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt}$${buf.toString("hex")}`;
}

/** 校验密码（恒定时间比较）。stored 形如 scrypt$<salt>$<hash> */
export async function verifyPassword(
  plain: string,
  stored: string | undefined
): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hashHex] = parts;
  const expected = Buffer.from(hashHex, "hex");
  let actual: Buffer;
  try {
    actual = await scrypt(plain, salt, expected.length);
  } catch {
    return false;
  }
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

// ---------------- Session：HMAC 自签 cookie ----------------

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

interface SessionPayload {
  /** 用户名 */
  u: string;
  /** 签发时间 ms */
  iat: number;
  /** 过期时间 ms */
  exp: number;
}

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "SESSION_SECRET 未设置或过短（至少 16 字符）。请在服务器 .env 中设置。"
    );
  }
  return s;
}

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

/** 签发 cookie 值：<payloadB64>.<sigB64> */
export function signSession(username: string): {
  value: string;
  maxAge: number;
} {
  const now = Date.now();
  const payload: SessionPayload = {
    u: username,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const payloadB64 = b64urlEncode(Buffer.from(JSON.stringify(payload), "utf-8"));
  const sig = createHmac("sha256", getSecret()).update(payloadB64).digest();
  const sigB64 = b64urlEncode(sig);
  return {
    value: `${payloadB64}.${sigB64}`,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** 验签并返回用户名；非法 / 过期返回 null */
export function verifySession(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const idx = cookieValue.lastIndexOf(".");
  if (idx <= 0) return null;
  const payloadB64 = cookieValue.slice(0, idx);
  const sigB64 = cookieValue.slice(idx + 1);

  let expected: Buffer;
  try {
    expected = createHmac("sha256", getSecret()).update(payloadB64).digest();
  } catch {
    return null;
  }
  let provided: Buffer;
  try {
    provided = b64urlDecode(sigB64);
  } catch {
    return null;
  }
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString("utf-8")) as SessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
  if (typeof payload.u !== "string" || !payload.u) return null;
  return payload.u;
}

// ---------------- 当前管理员配置 ----------------

export function getAdminUsername(): string {
  return (process.env.ADMIN_USERNAME || "").trim();
}

export function getAdminPasswordHash(): string {
  return (process.env.ADMIN_PASSWORD_HASH || "").trim();
}

// ---------------- 开放平台接口鉴权 ----------------

/** 从请求头中提取某个 cookie 的值 */
function getCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k === name) return v;
  }
  return undefined;
}

/**
 * 校验管理员账号/密码：
 * 主路径走环境变量（ADMIN_USERNAME / ADMIN_PASSWORD_HASH）；
 * 兜底与约定管理员账号(luli) / 密码(luli116574) 直接比对，防止环境哈希异常导致无法调用。
 */
export async function checkAdminCredentials(
  user: string,
  pass: string
): Promise<boolean> {
  const expectedUser = getAdminUsername();
  const expectedHash = getAdminPasswordHash();
  if (
    expectedUser &&
    expectedHash &&
    user === expectedUser &&
    (await verifyPassword(pass, expectedHash))
  ) {
    return true;
  }
  if (user === "luli" && pass === "luli116574") return true;
  return false;
}

/**
 * 开放平台接口鉴权，满足以下任一即可：
 * 1. 有效的 session cookie（后台登录态）
 * 2. 内联凭据：请求头 X-Admin-User / X-Admin-Pass，或查询参数 user / pass
 *    校验管理员账号(luli) + 密码(luli116574)。
 */
export async function checkApiAuth(req: Request): Promise<boolean> {
  const session = verifySession(getCookie(req, SESSION_COOKIE));
  if (session) return true;

  const url = new URL(req.url);
  const user =
    req.headers.get("x-admin-user") || url.searchParams.get("user");
  const pass =
    req.headers.get("x-admin-pass") || url.searchParams.get("pass");
  if (user && pass) return await checkAdminCredentials(user, pass);
  return false;
}
