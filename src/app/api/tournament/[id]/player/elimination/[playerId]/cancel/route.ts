import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; playerId: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    const playerId = parseInt(params.playerId);

    console.log("→ tournamentId:", tournamentId);
    console.log("→ playerId (registration_id):", playerId);

    if (isNaN(tournamentId) || isNaN(playerId)) {
      console.warn("⛔ Identifiants invalides");
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const assignment = await prisma.table_assignment.findFirst({
      where: {
        registration_id: BigInt(playerId),
        registration: {
          tournament_id: BigInt(tournamentId)
        }
      }
    });

    if (!assignment) {
      console.warn(
        `⛔ Aucune assignation trouvée pour registration_id=${playerId} et tournament_id=${tournamentId}`
      );
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    console.log("✅ Assignement trouvé:", assignment);

    await prisma.table_assignment.update({
      where: { id: assignment.id },
      data: {
        eliminated: false,
        user_kill_id: null
      }
    });

    console.log("✅ Assignement mis à jour (eliminated: false)");

    const deleted = await prisma.tournament_ranking.deleteMany({
      where: {
        registration_id: BigInt(playerId),
        tournament_id: BigInt(tournamentId)
      }
    });

    console.log(`🗑️ Rankings supprimés: ${deleted.count}`);

    return NextResponse.json({ message: "Elimination cancelled" });
  } catch (error) {
    console.error("🔥 Erreur lors de l'annulation de l'élimination:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
