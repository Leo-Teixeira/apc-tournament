import { NextResponse } from "next/server";
import { quarterRankingMocks } from "@/mock";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const MOCK_MODE = process.env.MOCK === "true";

export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json(quarterRankingMocks);
  }

  try {
    const rankings = await prisma.quarter_ranking.findMany({
      include: {
        wp_users: true,
        tournament: true
      }
    });

    return NextResponse.json(serializeBigInt(rankings));
  } catch (error) {
    console.error("Error fetching quarter rankings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
