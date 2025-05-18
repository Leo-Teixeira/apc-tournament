import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; playerId: string } }
) {
  try {
    const tournamentId = parseInt(params.id);
    const registrationId = parseInt(params.playerId);
    const { user_kill_id } = await req.json();

    console.log("→ tournamentId:", tournamentId);
    console.log("→ registrationId:", registrationId);
    console.log("→ user_kill_id (killer):", user_kill_id);

    if (isNaN(registrationId) || !user_kill_id) {
      console.warn("⛔ Données invalides");
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const assignment = await prisma.table_assignment.findFirst({
      where: {
        registration_id: BigInt(registrationId)
      },
      include: { registration: true }
    });

    if (!assignment) {
      console.warn(
        "⛔ Aucune assignation trouvée pour registration_id:",
        registrationId
      );
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    console.log("✅ Assignement trouvé:", assignment);

    const registration = assignment.registration;

    if (!registration) {
      console.warn("⛔ Aucune inscription liée à l'assignement");
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    console.log("✅ Inscription trouvée:", registration.id);

    const updatedAssignment = await prisma.table_assignment.update({
      where: { id: assignment.id },
      data: {
        eliminated: true,
        user_kill_id: BigInt(user_kill_id)
      }
    });

    console.log("✅ Assignement mis à jour:", updatedAssignment);

    const countEliminated = await prisma.table_assignment.count({
      where: {
        table_id: assignment.table_id,
        eliminated: true
      }
    });

    console.log("🎯 Nombre de joueurs éliminés sur la table:", countEliminated);

    const newRanking = await prisma.tournament_ranking.create({
      data: {
        registration_id: registration.id,
        tournament_id: BigInt(tournamentId),
        ranking_position: countEliminated,
        ranking_score: 0
      }
    });

    console.log("🏆 Enregistrement du ranking:", newRanking);

    return NextResponse.json(
      serializeBigInt({ message: "Player eliminated and ranking recorded" })
    );
  } catch (error) {
    console.error("🔥 Error in eliminate route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
