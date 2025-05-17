import { tournamentLevelMocks } from "@/mock";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { getDurationInMinutes } from "@/app/utils/date";

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    const updatedLevel = await prisma.tournament_level.update({
      where: { id: BigInt(data.id) },
      data: {
        level_end: data.level_end,
        level_small_blinde: data.level_small_blinde,
        level_big_blinde: data.level_big_blinde,
        level_pause: data.level_pause,
        level_chip_race: data.level_chip_race,
        level_ante: data.level_ante
      }
    });

    return NextResponse.json(serializeBigInt(updatedLevel));
  } catch (error) {
    console.error("Error updating level:", error);
    return NextResponse.json(
      { error: "Failed to update level" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const levelId = parseInt(params.id);

    const deletedLevel = await prisma.tournament_level.findUnique({
      where: { id: levelId }
    });

    if (!deletedLevel) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    const tournamentId = deletedLevel.tournament_id;
    const levelNumber = deletedLevel.level_number;

    await prisma.$transaction(async (tx) => {
      await tx.tournament_level.delete({
        where: { id: levelId }
      });

      const previousLevel = await tx.tournament_level.findFirst({
        where: {
          tournament_id: tournamentId,
          level_number: levelNumber - 1
        }
      });

      const followingLevels = await tx.tournament_level.findMany({
        where: {
          tournament_id: tournamentId,
          level_number: { gt: levelNumber }
        },
        orderBy: { level_number: "asc" }
      });

      let previousEnd = previousLevel
        ? new Date(previousLevel.level_end)
        : new Date(deletedLevel.level_start);

      for (const level of followingLevels) {
        const durationMin = getDurationInMinutes(
          new Date(level.level_start),
          new Date(level.level_end)
        );

        const newStart = new Date(previousEnd);
        const newEnd = new Date(newStart.getTime() + durationMin * 60 * 1000);

        await tx.tournament_level.update({
          where: { id: level.id },
          data: {
            level_number: level.level_number - 1,
            level_start: newStart,
            level_end: newEnd
          }
        });

        previousEnd = newEnd;
      }
    });

    return NextResponse.json({
      message: "Level deleted and reordered successfully"
    });
  } catch (error) {
    console.error("Error in DELETE level reorder:", error);
    return NextResponse.json(
      { error: "Failed to delete and reorder levels" },
      { status: 500 }
    );
  }
}
