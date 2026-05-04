import { NextRequest, NextResponse } from "next/server";
import { signInWithTelegram } from "@/lib/auth";
import { notifyAdminAccessRequest } from "@/lib/notify";

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
      const { error, code } = result;

      if (error === "Access denied") {
        return NextResponse.json({ error: "Access rejected" }, { status: 403 });
      }

      if (error === "Account pending approval") {
        return NextResponse.json({ status: "pending" });
      }

      return NextResponse.json({ error }, { status: code });
    }

    const user = result.user;

    if (user.status === "REJECTED") {
      return NextResponse.json({ error: "Access rejected" }, { status: 403 });
    }

    if (user.status === "PENDING") {
      await notifyAdminAccessRequest(user);
      return NextResponse.json({ status: "pending" });
    }

    if (user.status === "ACTIVE") {
      return NextResponse.json({ status: "active" });
    }

    return NextResponse.json({ status: "pending" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}