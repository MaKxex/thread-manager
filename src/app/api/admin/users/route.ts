import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromMiddleware } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthFromMiddleware(request, { role: "ADMIN" });

    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.code }
      );
    }

    const body = await request.json();
    const { telegramId, firstName, lastName, username } = body;

    if (!telegramId || typeof telegramId !== "string") {
      return NextResponse.json(
        { error: "telegramId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { id: telegramId },
      update: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        username: username ?? undefined,
        status: "ACTIVE",
        role: "USER",
      },
      create: {
        id: telegramId,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        username: username ?? null,
        status: "ACTIVE",
        role: "USER",
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}