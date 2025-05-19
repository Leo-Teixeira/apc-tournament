import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(_: NextRequest) {
  try {
    const result = await prisma.stack.findMany({
      include: {
        stack_chip: {
          include: {
            chip: true
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt(result));
  } catch (error) {
    console.error("Error fetching stack:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
