import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tournament_tournament_status } from "@/generated/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tournamentId = BigInt(params.id);

  try {
    const body = await req.json();
    const { status } = body;

    if (
      !status ||
      !Object.values(tournament_tournament_status).includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid or missing status" },
        { status: 400 }
      );
    }

    if (status === "in_coming") {
      // 1. Date locale ajustée pour éviter conversion en UTC à l'enregistrement
      const now = new Date();
      const offsetMs = now.getTimezoneOffset() * 60000;
      const localDate = new Date(now.getTime() - offsetMs);

      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          tournament_start_date: localDate,
          tournament_status: status
        }
      });

      // 2. Mise à jour des niveaux à partir de l'heure locale ajustée
      const levels = await prisma.tournament_level.findMany({
        where: { tournament_id: tournamentId },
        orderBy: { level_number: "asc" }
      });

      let previousEnd = new Date(localDate);

      const updatedLevels = await Promise.all(
        levels.map((level) => {
          const originalDuration =
            new Date(level.level_end).getTime() -
            new Date(level.level_start).getTime();

          const start = new Date(previousEnd);
          const end = new Date(start.getTime() + originalDuration);
          previousEnd = end;

          return prisma.tournament_level.update({
            where: { id: level.id },
            data: {
              level_start: start,
              level_end: end
            }
          });
        })
      );

      return NextResponse.json(
        serializeBigInt({
          message: "Tournament started and levels updated (local time)",
          startDate: localDate,
          levels: updatedLevels
        }),
        { status: 200 }
      );
    } else {
      const updated = await prisma.tournament.update({
        where: { id: tournamentId },
        data: { tournament_status: status }
      });

      return NextResponse.json(serializeBigInt(updated), { status: 200 });
    }
  } catch (error) {
    console.error("❌ Error updating tournament status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
