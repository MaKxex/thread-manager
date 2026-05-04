import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }

  const body = await request.json();
  const { threadId, type } = body;

  if (!threadId || !type || !["small", "big"].includes(type)) {
    return NextResponse.json(
      { error: "threadId and type ('small' | 'big') are required" },
      { status: 400 }
    );
  }

  const item = await prisma.threadItem.create({
    data: { threadId: Number(threadId), type },
  });

  await prisma.thread.updateMany({
    where: { id: Number(threadId), hasBeen: false },
    data: { hasBeen: true },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const item = await prisma.threadItem.delete({ where: { id: Number(id) } });
  return NextResponse.json(item);
}