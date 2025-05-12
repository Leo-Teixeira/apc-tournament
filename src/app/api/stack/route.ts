import { stackMock } from "@/mock/stack.mock";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const isMock = process.env.MOCK === "true";

export async function GET(_: NextRequest) {
  if (isMock) {
    return NextResponse.json(JSON.parse(JSON.stringify(stackMock ?? [])));
  }

  try {
    const result = await prisma.stack.findMany({
      include: {
        chip: true
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching stack:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
