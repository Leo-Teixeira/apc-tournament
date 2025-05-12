import { stackMock } from "@/mock/stack.mock";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const isMock = process.env.MOCK === "true";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (isMock) {
    const result = stackMock.find((stack) => String(stack.id) === id);
    return NextResponse.json(JSON.parse(JSON.stringify(result ?? {})));
  }

  try {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await prisma.stack.findUnique({
      where: { id: numericId },
      include: { chip: true }
    });

    if (!result) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stack by ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
