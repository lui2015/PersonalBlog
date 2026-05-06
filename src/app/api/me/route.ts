import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const u = verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!u) {
    return NextResponse.json({ authed: false }, { status: 200 });
  }
  return NextResponse.json({ authed: true, username: u });
}
