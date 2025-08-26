import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tournament_tournament_status } from "@/generated/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { extractParamsFromPath } from "@/app/utils/api-params";
import { toLocalISOString } from "@/app/utils/date";

export async function PATCH(req: NextRequest) {
  const { tournament } = extractParamsFromPath(req, ["tournament"]);

  if (!tournament) {
    return NextResponse.json(
      { error: "Missing tournament ID" },
      { status: 400 }
    );
  }

  const tournamentId = BigInt(tournament);

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
      const localDate = new Date();
      
      console.log("Date actuelle (localDate):", localDate.toISOString());
    
      await prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          tournament_start_date: localDate,
          tournament_status: status
        }
      });
    
      const levels = await prisma.tournament_level.findMany({
        where: { tournament_id: tournamentId },
        orderBy: { level_number: "asc" }
      });
    
      console.log("Niveaux récupérés :", levels.map(level => ({
        id: level.id,
        level_number: level.level_number,
        level_start: level.level_start,
        level_end: level.level_end
      })));
    
      let previousEnd = localDate;
    
      const updatedLevels = await Promise.all(
        levels.map(level => {
          const startDate = new Date(level.level_start);
          const endDate = new Date(level.level_end);
    
          let originalDuration = 20 * 60 * 1000; // 20 minutes par défaut
    
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const duration = endDate.getTime() - startDate.getTime();
            if (duration > 0) originalDuration = duration;
          }
    
          const start = new Date(previousEnd);
          const end = new Date(start.getTime() + originalDuration);
    
          console.log(`Mise à jour du niveau ${level.level_number} (ID: ${level.id}):`);
          console.log(" - Ancien start:", startDate.toISOString());
          console.log(" - Ancien end:", endDate.toISOString());
          console.log(" - Durée calculée (ms):", originalDuration);
          console.log(" - Nouveau start:", start.toISOString());
          console.log(" - Nouveau end:", end.toISOString());
    
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
    
      return NextResponse.json(serializeBigInt({
        message: "Tournament started and levels updated (local time)",
        startDate: toLocalISOString(localDate),
        levels: updatedLevels.map(level => ({
          ...level,
          level_start: toLocalISOString(new Date(level.level_start)),
          level_end: toLocalISOString(new Date(level.level_end))
        }))
      }), { status: 200 });
    
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

