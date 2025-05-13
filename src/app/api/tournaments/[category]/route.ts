import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tournamentMocks } from "@/mock";
import { tournament_tournament_category } from "@/generated/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const categoryMap: Record<string, tournament_tournament_category> = {
  apt: tournament_tournament_category.APT,
  ag: tournament_tournament_category.AG,
  sit_and_go: tournament_tournament_category.SitAndGo,
  superfinale: tournament_tournament_category.Superfinale,
  solipoker: tournament_tournament_category.Solipoker
};

export async function GET(
  _: NextRequest,
  { params }: { params: { category: string } }
) {
  const { category } = params;
  const rawCategory = category.toLowerCase();

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

  const categoryEnum = categoryMap[rawCategory];

  const validCategories = Object.values(tournament_tournament_category);

  if (!categoryEnum) {
    return NextResponse.json(
      { error: `Invalid category '${category}'` },
      { status: 400 }
    );
  }

  try {
    const tournaments = await prisma.tournament.findMany({
      where: { tournament_category: categoryEnum }
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
