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

    const registration = assignment.registration;

    if (!registration) {
      console.warn("⛔ Aucune inscription liée à l'assignement");
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    await prisma.table_assignment.update({
      where: { id: assignment.id },
      data: {
        eliminated: true,
        user_kill_id: BigInt(user_kill_id)
      }
    });

    const countEliminated = await prisma.table_assignment.count({
      where: {
        table_id: assignment.table_id,
        eliminated: true
      }
    });

    const tournament = await prisma.tournament.findUnique({
      where: { id: BigInt(tournamentId) }
    });

    const totalRegistrations = await prisma.registration.count({
      where: { tournament_id: BigInt(tournamentId) }
    });

    let score = 0;

    if (tournament?.tournament_category === "APT") {
      const aptScoreRanges = [
        { min: 0, max: 15, scores: [26, 18, 12, 8, 6, 5] },
        { min: 16, max: 20, scores: [28, 20, 15, 11, 8, 5, 3] },
        { min: 21, max: 25, scores: [35, 25, 18, 13, 9, 6, 4, 3, 2] },
        { min: 26, max: 30, scores: [40, 28, 21, 15, 11, 8, 6, 4, 3, 2, 1] },
        {
          min: 31,
          max: 35,
          scores: [45, 32, 24, 18, 13, 10, 6, 5, 4, 3, 2, 1, 1]
        },
        {
          min: 36,
          max: 40,
          scores: [51, 36, 27, 20, 15, 11, 8, 6, 5, 4, 3, 2, 1, 1]
        },
        {
          min: 41,
          max: 45,
          scores: [56, 41, 30, 22, 16, 12, 9, 7, 6, 5, 4, 3, 2, 1, 1]
        },
        {
          min: 46,
          max: 50,
          scores: [62, 47, 33, 24, 17, 13, 9, 7, 5, 4, 3, 2, 2, 1, 1, 1]
        },
        {
          min: 51,
          max: 55,
          scores: [67, 51, 36, 26, 19, 14, 10, 8, 6, 5, 4, 3, 2, 1, 1, 1, 1]
        },
        {
          min: 56,
          max: 60,
          scores: [73, 56, 39, 28, 20, 15, 11, 9, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1]
        }
      ];

      const getAptScore = (playerCount: number, position: number): number => {
        const range = aptScoreRanges.find(
          (r) => playerCount >= r.min && playerCount <= r.max
        );
        if (!range) return 0;
        return range.scores[position - 1] ?? 0;
      };

      score = getAptScore(totalRegistrations, countEliminated);
    }

    console.log("🎯 Total players:", totalRegistrations);
    console.log("🎯 Position:", countEliminated);
    console.log("🎯 Score attribué:", score);

    const newRanking = await prisma.tournament_ranking.create({
      data: {
        registration_id: registration.id,
        tournament_id: BigInt(tournamentId),
        ranking_position: countEliminated,
        ranking_score: score
      }
    });

    console.log("🏆 Ranking enregistré:", newRanking);

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
