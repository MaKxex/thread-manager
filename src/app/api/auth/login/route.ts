import { NextRequest, NextResponse } from "next/server";
import { signInWithTelegram, createSession, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    if (!initData || typeof initData !== "string") {
      return NextResponse.json(
        { error: "initData is required" },
        { status: 400 }
      );
    }

    const result = await signInWithTelegram(initData);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.code }
      );
    }

    const user = result.user;

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const token = await createSession(user);
    const headers = setAuthCookie(token);

    return NextResponse.json({ user }, { headers });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}