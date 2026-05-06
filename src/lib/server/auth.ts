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
