import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }

  const { id } = await params;
  const thread = await prisma.thread.findUnique({
    where: { id: Number(id) },
    include: {
      catalog: true,
      items: true,
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const smallCount = thread.items.filter((i) => i.type === "small").length;
  const bigCount = thread.items.filter((i) => i.type === "big").length;

  return NextResponse.json({ ...thread, smallCount, bigCount });
}