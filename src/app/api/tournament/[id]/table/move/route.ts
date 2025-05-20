import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournamentId = BigInt(params.id);
    const body = await req.json();
    const { playerId, mode, targetId } = body;

    if (!playerId || !mode || !targetId)
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );

    if (mode === "swap") {
      const [playerA, playerB] = await prisma.table_assignment.findMany({
        where: {
          id: { in: [BigInt(playerId), BigInt(targetId)] }
        }
      });

      if (!playerA || !playerB)
        return NextResponse.json(
          { error: "Joueurs non trouvés" },
          { status: 404 }
        );

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

      if (!player)
        return NextResponse.json(
          { error: "Joueur non trouvé" },
          { status: 404 }
        );

      const seatTaken = await prisma.table_assignment.findMany({
        where: {
          table_id: BigInt(targetId),
          eliminated: false
        },
        orderBy: { table_seat_number: "asc" }
      });

      const usedSeats = seatTaken.map((s) => s.table_seat_number);
      let seat = 1;
      while (usedSeats.includes(seat)) seat++;

      await prisma.table_assignment.update({
        where: { id: player.id },
        data: {
          table_id: BigInt(targetId),
          table_seat_number: seat
        }
      });

      return NextResponse.json({ message: "Joueur déplacé avec succès" });
    }

    return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
  } catch (err) {
    console.error("Erreur déplacement joueur :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
