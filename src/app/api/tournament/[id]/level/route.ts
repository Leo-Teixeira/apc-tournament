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
    const tournamentId = BigInt(data.tournament_id);

    const allLevels = await prisma.tournament_level.findMany({
      where: { tournament_id: tournamentId },
      orderBy: { level_number: "asc" }
    });

    const insertPosition = data.level_number ?? allLevels.length + 1;
    const referenceLevel = allLevels[insertPosition - 1];

    if (!referenceLevel) {
      return NextResponse.json(
        { error: "Invalid insert position" },
        { status: 400 }
      );
    }

    const newLevelDuration = parseInt(data.duration_minutes);

    if (isNaN(newLevelDuration) || newLevelDuration <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing duration_minutes" },
        { status: 400 }
      );
    }

    const newLevelStart = new Date(referenceLevel.level_start);
    const newLevelEnd = new Date(newLevelStart);
    newLevelEnd.setMinutes(newLevelEnd.getMinutes() + newLevelDuration);

    let currentTime = new Date(newLevelEnd);

    const updatedLevels = [];

    for (let i = insertPosition - 1; i < allLevels.length; i++) {
      const level = allLevels[i];
      const originalDuration =
        (new Date(level.level_end).getTime() -
          new Date(level.level_start).getTime()) /
        60000;

      const shiftStart = new Date(currentTime);
      const shiftEnd = new Date(currentTime);
      shiftEnd.setMinutes(shiftEnd.getMinutes() + originalDuration);
      currentTime = new Date(shiftEnd);

      updatedLevels.push(
        prisma.tournament_level.update({
          where: { id: level.id },
          data: {
            level_number: level.level_number + 1,
            level_start: shiftStart,
            level_end: shiftEnd
          }
        })
      );
    }

    const newLevel = await prisma.tournament_level.create({
      data: {
        tournament_id: tournamentId,
        level_number: insertPosition,
        level_start: newLevelStart,
        level_end: newLevelEnd,
        level_small_blinde: data.level_small_blinde,
        level_big_blinde: data.level_big_blinde,
        level_pause: data.level_pause,
        level_chip_race: data.level_chip_race,
        level_ante: data.level_ante
      }
    });

    await Promise.all(updatedLevels);

    return NextResponse.json(serializeBigInt(newLevel));
  } catch (error) {
    console.error("❌ Error creating and shifting levels:", error);
    return NextResponse.json(
      { error: "Failed to create and shift levels" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    if (isNaN(tournamentId)) {
      return NextResponse.json(
        { error: "Invalid tournament ID" },
        { status: 400 }
      );
    }

    const deleted = await prisma.tournament_level.deleteMany({
      where: {
        tournament_id: BigInt(tournamentId)
      }
    });

    return NextResponse.json({
      message: `Deleted ${deleted.count} levels`,
      count: deleted.count
    });
  } catch (error) {
    console.error("Error deleting levels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
