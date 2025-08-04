import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { tournament_tournament_status } from "@/generated/prisma";
import { extractParamsFromPath } from "@/app/utils/api-params";
import { reequilibrateTables } from "@/app/utils/reequilibrate";

async function updateQuarterRanking(tournamentId: number) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: BigInt(tournamentId) },
    select: {
      tournament_category: true,
      tournament_trimestry: true,
      tournament_start_date: true
    }
  });

  if (!tournament) return;

  const year = tournament.tournament_start_date.getFullYear();
  const { tournament_category, tournament_trimestry } = tournament;

  const relatedTournaments = await prisma.tournament.findMany({
    where: {
      tournament_category,
      tournament_trimestry,
      tournament_start_date: {
        gte: new Date(`${year}-01-01T00:00:00Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00Z`)
      }
    },
    select: { id: true }
  });

  const relatedIds = relatedTournaments.map((t) => t.id);

  const rankings = await prisma.tournament_ranking.findMany({
    where: { tournament_id: { in: relatedIds } },
    select: {
      registration: {
        select: { user_id: true }
      },
      ranking_score: true
    }
  });

  const scoreByUser: Record<string, number> = {};

  for (const r of rankings) {
    const userId = r.registration.user_id.toString();
    scoreByUser[userId] = (scoreByUser[userId] ?? 0) + r.ranking_score;
  }

  const sorted = Object.entries(scoreByUser)
    .map(([userId, score]) => ({ userId: BigInt(userId), score }))
    .sort((a, b) => b.score - a.score)
    .map((entry, i) => ({
      user_id: entry.userId,
      aggregated_score: entry.score,
      position: i + 1,
      trimestry_ranking: tournament_trimestry,
      quarter_ranking_year: year,
      tournament_id: relatedIds[0] // ou une autre logique
    }));
  await prisma.quarter_ranking.deleteMany({
    where: {
      trimestry_ranking: tournament_trimestry,
      quarter_ranking_year: year
    }
  });

  await prisma.quarter_ranking.createMany({ data: sorted });
}

export async function PUT(req: NextRequest) {
  const { tournament, player } = extractParamsFromPath(req, [
    "tournament",
    "player"
  ]);

  if (!tournament || !player) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const tournamentId = parseInt(tournament);
    const registrationId = parseInt(player);
    const { user_kill_id } = await req.json();

    if (isNaN(registrationId) || !user_kill_id) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const assignment = await prisma.table_assignment.findFirst({
      where: {
        registration_id: BigInt(registrationId)
      },
      include: { registration: true }
    });

    if (!assignment || !assignment.registration) {
      return NextResponse.json(
        { error: "Assignment or registration not found" },
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

    // Compter les joueurs éliminés uniquement parmi les registrations Confirmed
    const eliminatedCount = await prisma.table_assignment.count({
      where: {
        tournament_table: {
          tournament_id: BigInt(tournamentId)
        },
        eliminated: true,
        registration: {
          statut: "Confirmed"
        }
      }
    });

    // Compter les joueurs vivants uniquement parmi les registrations Confirmed
    const aliveCount = await prisma.table_assignment.count({
      where: {
        tournament_table: {
          tournament_id: BigInt(tournamentId)
        },
        eliminated: false,
        registration: {
          statut: "Confirmed"
        }
      }
    });

    // Total des joueurs Confirmed inscrits au tournoi
    const totalRegistrations = eliminatedCount + aliveCount;


    const tournamentData = await prisma.tournament.findUnique({
      where: { id: BigInt(tournamentId) }
    });

    let score = 0;

    if (tournamentData?.tournament_category === "APT") {
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

      const positionFromTop = totalRegistrations - eliminatedCount;
      const range = aptScoreRanges.find(
        (r) => totalRegistrations >= r.min && totalRegistrations <= r.max
      );
      score = range?.scores[positionFromTop - 1] ?? 0;
    } else if (tournamentData?.tournament_category === "SitAndGo") {
      const sitAndGoScores = {
        5: [5, 2, 0, 0, 0],
        6: [6, 3, 0, 0, 0, 0],
        7: [7, 4, 2, 0, 0, 0, 0],
        8: [8, 5, 3, 0, 0, 0, 0, 0],
        9: [9, 6, 4, 2, 0, 0, 0, 0, 0]
      };

      const positionFromTop = totalRegistrations - eliminatedCount;
      const scores = sitAndGoScores[totalRegistrations as keyof typeof sitAndGoScores];
      score = scores ? scores[positionFromTop - 1] ?? 0 : 0;
    }

    await prisma.tournament_ranking.create({
      data: {
        registration_id: assignment.registration.id,
        tournament_id: BigInt(tournamentId),
        ranking_position: totalRegistrations - eliminatedCount + 1,
        ranking_score: score
      }
    });

    const tables = await prisma.tournament_table.findMany({
      where: { tournament_id: BigInt(tournamentId) },
      include: {
        table_assignment: { where: { eliminated: false } }
      }
    });

    const tablesWithAlive = tables.filter((t) => t.table_assignment.length > 0);

    if (tablesWithAlive.length > 1) {
      const rebalanced = await reequilibrateTables(tournamentId);
      console.log("♻️ Rééquilibrage effectué ?", rebalanced);
    }

    if (aliveCount === 1) {
      await prisma.tournament.update({
        where: { id: BigInt(tournamentId) },
        data: { tournament_status: tournament_tournament_status.finish }
      });

      await updateQuarterRanking(tournamentId);
    }

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
