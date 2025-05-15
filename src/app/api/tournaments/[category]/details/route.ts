import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { tournament_tournament_category } from "@/generated/prisma";

const categoryMap: Record<string, tournament_tournament_category> = {
  apt: tournament_tournament_category.APT,
  ag: tournament_tournament_category.AG,
  sit_and_go: tournament_tournament_category.SitAndGo,
  superfinale: tournament_tournament_category.Superfinale,
  solipoker: tournament_tournament_category.Solipoker
};

export async function GET(
  request: NextRequest,
  context: { params: { category: string } }
) {
  const categoryParam = context.params.category;
  const normalizedCategory = categoryParam.toLowerCase();
  const mappedCategory = categoryMap[normalizedCategory];

  console.log("Received category param:", categoryParam);
  console.log("Normalized category:", normalizedCategory);
  console.log("Mapped category:", mappedCategory);

  if (!mappedCategory) {
    console.warn(`Invalid category received: ${categoryParam}`);
    return NextResponse.json(
      { error: `Invalid category '${categoryParam}'` },
      { status: 400 }
    );
  }

  try {
    console.log("Launching transaction for category:", mappedCategory);

    const [tournaments, registrations, quarterRanking] =
      await prisma.$transaction([
        prisma.tournament.findMany({
          where: { tournament_category: mappedCategory }
        }),
        prisma.registration.findMany({
          where: {
            tournament: { tournament_category: mappedCategory }
          },
          include: {
            tournament: true
          }
        }),
        prisma.quarter_ranking.findMany({
          where: {
            tournament: { tournament_category: mappedCategory }
          },
          include: {
            wp_users: {
              select: {
                ID: true,
                pseudo_winamax: true,
                display_name: true,
                user_email: true
              }
            },
            tournament: true
          }
        })
      ]);

    return NextResponse.json(
      serializeBigInt({ tournaments, registrations, quarterRanking })
    );
  } catch (error: any) {
    console.error("Error fetching data by category:", error.message);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
