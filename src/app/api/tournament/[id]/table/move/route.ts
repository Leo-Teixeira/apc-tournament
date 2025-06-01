import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { extractParamsFromPath } from "@/app/utils/api-params";

export async function POST(req: NextRequest) {
  try {
    const { tournament } = extractParamsFromPath(req, ["tournament"]);

    if (!tournament) {
      return NextResponse.json(
        { error: "Missing tournament ID" },
        { status: 400 }
      );
    }

    const tournamentId = BigInt(tournament);
    const body = await req.json();
    const { playerId, mode, targetId, seatNumber } = body;

    if (!playerId || !mode || !targetId) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    if (mode === "swap") {
      const [playerA, playerB] = await prisma.table_assignment.findMany({
        where: {
          id: { in: [BigInt(playerId), BigInt(targetId)] }
        }
      });

      if (!playerA || !playerB) {
        return NextResponse.json(
          { error: "Joueurs non trouvés" },
          { status: 404 }
        );
      }

      await prisma.$transaction([
        prisma.table_assignment.update({
          where: { id: playerA.id },
          data: {
            table_id: playerB.table_id,
            table_seat_number: playerB.table_seat_number
          }
        }),
        prisma.table_assignment.update({
          where: { id: playerB.id },
          data: {
            table_id: playerA.table_id,
            table_seat_number: playerA.table_seat_number
          }
        })
      ]);

      return NextResponse.json({ message: "Échange effectué avec succès" });
    }

    if (mode === "move") {
      const player = await prisma.table_assignment.findUnique({
        where: { id: BigInt(playerId) }
      });

      if (!player) {
        return NextResponse.json(
          { error: "Joueur non trouvé" },
          { status: 404 }
        );
      }

      const assignments = await prisma.table_assignment.findMany({
        where: {
          table_id: BigInt(targetId),
          eliminated: false
        },
        orderBy: { table_seat_number: "asc" }
      });

      const usedSeats = assignments.map((a) => a.table_seat_number);

      let targetSeat = seatNumber ? parseInt(seatNumber) : 1;
      if (!targetSeat || isNaN(targetSeat) || targetSeat < 1) {
        while (usedSeats.includes(targetSeat)) targetSeat++;
      }

      const conflict = assignments.find(
        (a) => a.table_seat_number === targetSeat
      );

      const updates = [];

      if (conflict) {
        const lastSeat = Math.max(...usedSeats) + 1;
        updates.push(
          prisma.table_assignment.update({
            where: { id: conflict.id },
            data: {
              table_seat_number: lastSeat
            }
          })
        );
      }

      updates.push(
        prisma.table_assignment.update({
          where: { id: player.id },
          data: {
            table_id: BigInt(targetId),
            table_seat_number: targetSeat
          }
        })
      );

      await prisma.$transaction(updates);

      return NextResponse.json({ message: "Joueur déplacé avec succès" });
    }

    return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
  } catch (err) {
    console.error("Erreur déplacement joueur :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
