import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { number, catalogId, name, color } = body;

  if (number === undefined || number === null || catalogId === undefined || catalogId === null) {
    return NextResponse.json(
      { error: "number and catalogId are required" },
      { status: 400 }
    );
  }

  const num = Number(number);
  const catId = Number(catalogId);

  if (!Number.isFinite(num) || num <= 0) {
    return NextResponse.json(
      { error: "number must be a positive integer" },
      { status: 400 }
    );
  }

  if (!Number.isFinite(catId) || catId <= 0) {
    return NextResponse.json(
      { error: "catalogId must be a positive integer" },
      { status: 400 }
    );
  }

  try {
    const thread = await prisma.thread.create({
      data: { number: num, catalogId: catId, name: name || "", color: color || "" },
    });
    return NextResponse.json(thread, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Thread with this number already exists or catalog not found" },
      { status: 409 }
    );
  }
}
