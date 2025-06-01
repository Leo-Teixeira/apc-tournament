import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { extractParamsFromPath } from "@/app/utils/api-params";

export async function POST(req: NextRequest) {
  const { tournament } = extractParamsFromPath(req, ["tournament"]);

  if (!tournament) {
    return NextResponse.json(
      { error: "Missing tournament ID" },
      { status: 400 }
    );
  }

  try {
    const tournamentId = parseInt(tournament);
    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    const tournamentData = await prisma.tournament.findUnique({
      where: { id: BigInt(tournamentId) }
    });

    if (!tournamentData) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    const startDate = new Date(tournamentData.tournament_start_date);
    const estimateDuration = new Date(tournamentData.estimate_duration);
    const totalMinutes =
      estimateDuration.getUTCHours() * 60 + estimateDuration.getUTCMinutes();

    const levels: any[] = [];
    let currentTime = new Date(startDate);
    let elapsedMinutes = 0;
    let levelNumber = 1;
    let sb = 25;
    let bb = 50;
    let consecutivePlayedLevels = 0;

    while (elapsedMinutes < totalMinutes) {
      const isPause = consecutivePlayedLevels === 3;
      const duration = isPause ? 15 : 20;

      const levelStart = new Date(currentTime);
      const levelEnd = new Date(currentTime);
      levelEnd.setMinutes(levelEnd.getMinutes() + duration);

      levels.push({
        tournament_id: tournamentData.id,
        level_number: levelNumber,
        level_start: levelStart,
        level_end: levelEnd,
        level_small_blinde: isPause ? 0 : sb,
        level_big_blinde: isPause ? 0 : bb,
        level_pause: isPause,
        level_chip_race: false,
        level_ante: 0
      });

      if (isPause) {
        consecutivePlayedLevels = 0;
      } else {
        sb = bb;
        bb += 50;
        consecutivePlayedLevels++;
      }

      currentTime = levelEnd;
      elapsedMinutes += duration;
      levelNumber++;
    }

    await prisma.tournament_level.createMany({ data: levels });

    return NextResponse.json(serializeBigInt(levels));
  } catch (error) {
    console.error("Erreur génération niveaux :", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la génération" },
      { status: 500 }
    );
  }
}
