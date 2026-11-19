import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  checkAdminCredentials,
  getAdminPasswordHash,
  signSession,
} from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(req: Request) {
  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const username = (body.username ?? "").trim();
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json({ error: "missing credentials" }, { status: 400 });
  }

  // scrypt 哈希形如 scrypt$<salt>$<hash>，若被 shell 展开成不带 $ 的字符串，
  // verifyPassword 会静默失败导致管理员被锁死；这里显式检测并打日志。
  const hash = getAdminPasswordHash();
  if (!/^scrypt\$[0-9a-f]+\$[0-9a-f]+$/i.test(hash)) {
    console.error(
      "[login] ADMIN_PASSWORD_HASH 缺失或格式异常（常见原因：source .env 时 $ 被 shell 展开）。请检查 .env / PM2 环境。"
    );
  }

  // 与开放接口 /api/open/* 共用同一套校验：环境变量异常时仍有内置管理员兜底，
  // 避免配置问题把管理员彻底锁在后台外面。
  if (!(await checkAdminCredentials(username, password))) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const { value, maxAge } = signSession(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ ok: true, username });
}
