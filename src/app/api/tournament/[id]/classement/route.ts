import { tournamentRankingMocks } from "@/mock";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const isMock = process.env.MOCK === "true";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (isMock) {
    const result = tournamentRankingMocks.filter(
      (ranking) => ranking.tournament_id.id === id
    );
    return NextResponse.json(JSON.parse(JSON.stringify(result ?? [])));
  }

  const tournamentId = parseInt(id);
  if (isNaN(tournamentId)) {
    return NextResponse.json(
      { error: "Invalid tournament ID" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.tournament_ranking.findMany({
      where: { tournament_id: tournamentId },
      include: {
        registration: {
          include: {
            wp_users: {
              select: {
                ID: true,
                pseudo_winamax: true,
                photo_url: true,
                display_name: true,
                user_status: true,
                user_url: true,
                user_email: true,
                user_nicename: true,
                user_login: true
              }
            },
            table_assignment: true,
            tournament_ranking: true
          }
        },

        tournament: true
      }
    });

    return NextResponse.json(serializeBigInt(result));
  } catch (error) {
    console.error("Error fetching tournament rankings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
