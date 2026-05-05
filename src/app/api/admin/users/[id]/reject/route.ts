import { NextRequest, NextResponse } from "next/server";
import { requireAuthFromMiddleware } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuthFromMiddleware(request, { role: "ADMIN" });

    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.code }
      );
    }

    const { id } = await params;

    const user = await prisma.user.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}