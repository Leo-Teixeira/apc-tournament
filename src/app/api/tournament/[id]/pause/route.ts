import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tournamentId = BigInt(params.id);

  try {
    const { pause } = await req.json();

    if (typeof pause !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const now = new Date();

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { tournament_level: { orderBy: { level_number: "asc" } } }
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (pause) {
      const updated = await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          tournament_pause: true,
          tournament_pause_date: now
        }
      });

      return NextResponse.json(serializeBigInt(updated));
    }

    if (!tournament.tournament_pause_date) {
      return NextResponse.json({ error: "No pause date set" }, { status: 400 });
    }

    const pauseDate = new Date(tournament.tournament_pause_date);

    const updatedLevels = [];
    let found = false;
    let offset = now;

    for (const level of tournament.tournament_level) {
      const levelStart = new Date(level.level_start);
      const levelEnd = new Date(level.level_end);

      if (!found && pauseDate >= levelStart && pauseDate < levelEnd) {
        const remainingMs = levelEnd.getTime() - pauseDate.getTime();
        const newStart = offset;
        const newEnd = new Date(newStart.getTime() + remainingMs);
        offset = newEnd;
        found = true;

        updatedLevels.push({
          id: level.id,
          level_start: newStart,
          level_end: newEnd
        });
        continue;
      }

      if (found) {
        const duration =
          new Date(level.level_end).getTime() -
          new Date(level.level_start).getTime();
        const newStart = offset;
        const newEnd = new Date(newStart.getTime() + duration);
        offset = newEnd;

        updatedLevels.push({
          id: level.id,
          level_start: newStart,
          level_end: newEnd
        });
      }
    }

    await prisma.$transaction([
      prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          tournament_pause: false,
          tournament_pause_date: null
        }
      }),
      ...updatedLevels.map((level) =>
        prisma.tournament_level.update({
          where: { id: level.id },
          data: {
            level_start: level.level_start,
            level_end: level.level_end
          }
        })
      )
    ]);

    return NextResponse.json(serializeBigInt({ success: true }));
  } catch (err) {
    console.error("❌ Error toggling pause:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
