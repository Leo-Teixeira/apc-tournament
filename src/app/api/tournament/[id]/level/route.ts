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

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newLevel = await prisma.tournament_level.create({
      data: {
        tournament_id: BigInt(data.tournament_id),
        level_number: data.level_number,
        level_start: data.level_start,
        level_end: data.level_end,
        level_small_blinde: data.level_small_blinde,
        level_big_blinde: data.level_big_blinde,
        level_pause: data.level_pause,
        level_chip_race: data.level_chip_race,
        level_ante: data.level_ante
      }
    });

    return NextResponse.json(serializeBigInt(newLevel));
  } catch (error) {
    console.error("Error creating level:", error);
    return NextResponse.json(
      { error: "Failed to create level" },
      { status: 500 }
    );
  }
}
