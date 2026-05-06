import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  getAdminPasswordHash,
  getAdminUsername,
  signSession,
  verifyPassword,
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

  const expectedUser = getAdminUsername();
  const expectedHash = getAdminPasswordHash();
  if (!expectedUser || !expectedHash) {
    return NextResponse.json(
      { error: "server not configured" },
      { status: 500 }
    );
  }

  // 用户名也走恒定时间感（先比对长度，再比对 password）
  // 即使用户名错误也要走一次 verifyPassword，防止时序探测
  const userOk = username === expectedUser;
  const passOk = await verifyPassword(password, expectedHash);
  if (!userOk || !passOk) {
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
