import { tournamentLevelMocks } from "@/mock";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const MOCK = process.env.MOCK === "true";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (MOCK) {
    const result = tournamentLevelMocks.filter((level) =>
      typeof level.tournament_id === "string"
        ? level.tournament_id === id
        : level.tournament_id.id === id
    );
    return NextResponse.json(result);
  }

  try {
    const tournamentId = parseInt(id);
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const levels = await prisma.tournament_level.findMany({
      where: { tournament_id: tournamentId },
      select: {
        id: true,
        tournament_id: true,
        level_number: true,
        level_start: true,
        level_end: true,
        level_small_blinde: true,
        level_big_blinde: true,
        level_pause: true,
        level_chip_race: true
      }
    });

    return NextResponse.json(serializeBigInt(levels));
  } catch (error) {
    console.error("Error fetching levels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
