import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthFromMiddleware } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuthFromMiddleware(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }
  const catalogs = await prisma.catalog.findMany({
    include: {
      threads: {
        orderBy: { number: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(catalogs);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuthFromMiddleware(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.code });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  try {
    const catalog = await prisma.catalog.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(catalog, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Catalog with this name already exists" },
      { status: 409 }
    );
  }
}
