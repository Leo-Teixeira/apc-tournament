import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tournamentMocks } from "@/mock";
import { tournament_tournament_category } from "@/generated/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function GET(
  _: NextRequest,
  { params }: { params: { category: string } }
) {
  const { category } = await params;
  const isMock = process.env.MOCK === "true";

  if (isMock) {
    const filtered = tournamentMocks.filter((tournament) =>
      category
        ? tournament.tournament_category.toLowerCase() ===
          category.toLowerCase()
        : true
    );
    return NextResponse.json(filtered);
  }

  const validCategories = Object.values(tournament_tournament_category);
  const categoryEnum = validCategories.includes(category as any)
    ? (category as tournament_tournament_category)
    : undefined;

  try {
    const tournaments = await prisma.tournament.findMany({
      where: categoryEnum
        ? {
            tournament_category: categoryEnum
          }
        : undefined
    });

    return NextResponse.json(serializeBigInt(tournaments));
  } catch (error) {
    console.error("Error fetching tournaments by category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
