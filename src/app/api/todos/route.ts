import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFromMiddleware } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuthFromMiddleware(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }

  const todos = await prisma.todo.findMany({
    orderBy: { id: "asc" },
    include: { createdBy: true },
  });
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuthFromMiddleware(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }

  const body = await request.json();
  const { text } = body;

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const todo = await prisma.todo.create({ data: { text, completed: false, createdById: authResult.user.id } });
  return NextResponse.json(todo, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuthFromMiddleware(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }

  const body = await request.json();
  const { id, completed } = body;

  if (id === undefined || completed === undefined) {
    return NextResponse.json(
      { error: "id and completed are required" },
      { status: 400 }
    );
  }

  const todo = await prisma.todo.update({
    where: { id: Number(id) },
    data: { completed },
  });
  return NextResponse.json(todo);
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuthFromMiddleware(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const todo = await prisma.todo.delete({ where: { id: Number(id) } });
  return NextResponse.json(todo);
}