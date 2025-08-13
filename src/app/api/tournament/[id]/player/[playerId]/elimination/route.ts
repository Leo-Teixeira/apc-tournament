import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { serializeBigInt } from "@/app/utils/serializeBigInt";
import { tournament_tournament_status } from "@/generated/prisma";
import { extractParamsFromPath } from "@/app/utils/api-params";
import { reequilibrateTables } from "@/app/utils/reequilibrate";

// ----------- HELPERS SCORE -----------
function getAptScore(total: number, rank: number): number {
  const aptScoreRanges = [
    { min: 0,  max: 15, scores: [26, 18, 12, 8, 6, 5] },
    { min: 16, max: 20, scores: [28, 20, 15, 11, 8, 5, 3] },
    { min: 21, max: 25, scores: [35, 25, 18, 13, 9, 6, 4, 3, 2] },
    { min: 26, max: 30, scores: [40, 28, 21, 15, 11, 8, 6, 4, 3, 2, 1] },
    { min: 31, max: 35, scores: [45, 32, 24, 18, 13, 10, 6, 5, 4, 3, 2, 1, 1] },
    { min: 36, max: 40, scores: [51, 36, 27, 20, 15, 11, 8, 6, 5, 4, 3, 2, 1, 1] },
    { min: 41, max: 45, scores: [56, 41, 30, 22, 16, 12, 9, 7, 6, 5, 4, 3, 2, 1, 1] },
    { min: 46, max: 50, scores: [62, 47, 33, 24, 17, 13, 9, 7, 5, 4, 3, 2, 2, 1, 1, 1] },
    { min: 51, max: 55, scores: [67, 51, 36, 26, 19, 14, 10, 8, 6, 5, 4, 3, 2, 1, 1, 1, 1] },
    { min: 56, max: 60, scores: [73, 56, 39, 28, 20, 15, 11, 9, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1] }
  ] as const;
  const range = aptScoreRanges.find(r => total >= r.min && total <= r.max);
  return range?.scores[rank - 1] ?? 0;
}

function getSitAndGoScore(total: number, rank: number): number {
  const sitAndGoScores: Record<number, number[]> = {
    5: [5, 2, 0, 0, 0],
    6: [6, 3, 0, 0, 0, 0],
    7: [7, 4, 2, 0, 0, 0, 0],
    8: [8, 5, 3, 0, 0, 0, 0, 0],
    9: [9, 6, 4, 2, 0, 0, 0, 0, 0]
  };
  const scores = sitAndGoScores[total];
  return scores ? scores[rank - 1] ?? 0 : 0;
}

async function getScoreAndRankingPosition(
  tx: typeof prisma,
  tournamentId: number | bigint,
  ranking_position: number
) {
  const tournament = await tx.tournament.findUnique({
    where: { id: BigInt(tournamentId) }
  });
  if (!tournament) {
    return { ranking_position, score: 0, tournament_category: undefined, totalRegistrations: 0 };
  }
  const totalRegistrations = await tx.registration.count({
    where: {
      tournament_id: BigInt(tournamentId),
      statut: "Confirmed"
    }
  });

  let score = 0;
  if (tournament.tournament_category === "APT") {
    score = getAptScore(totalRegistrations, ranking_position);
  } else if (tournament.tournament_category === "SitAndGo") {
    score = getSitAndGoScore(totalRegistrations, ranking_position);
  }

  return { ranking_position, score, tournament_category: tournament.tournament_category, totalRegistrations };
}

async function updateQuarterRanking(tournamentId: number) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: BigInt(tournamentId) },
    select: { tournament_category: true, tournament_trimestry: true, tournament_start_date: true }
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

  const relatedIds = relatedTournaments.map(t => t.id);
  const rankings = await prisma.tournament_ranking.findMany({
    where: { tournament_id: { in: relatedIds } },
    select: { registration: { select: { user_id: true } }, ranking_score: true }
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
      tournament_id: relatedIds[0]
    }));

  await prisma.quarter_ranking.deleteMany({
    where: { trimestry_ranking: tournament_trimestry, quarter_ranking_year: year }
  });
  await prisma.quarter_ranking.createMany({ data: sorted });
}

// ----------- API PUT ELIMINATION -----------
export async function PUT(req: NextRequest) {
  const { tournament, player } = extractParamsFromPath(req, ["tournament", "player"]);
  if (!tournament || !player)
    return NextResponse.json({ error: "Missing params" }, { status: 400 });

  try {
    const tournamentId = parseInt(tournament);
    const registrationId = parseInt(player);
    const { user_kill_id } = await req.json();

    if (isNaN(registrationId) || !user_kill_id)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const tournamentData = await prisma.tournament.findUnique({
      where: { id: BigInt(tournamentId) },
      select: { tournament_category: true }
    });
    if (!tournamentData)
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

    const { tournament_category } = tournamentData;

    const assignment = await prisma.table_assignment.findFirst({
      where: { registration_id: BigInt(registrationId) },
      include: { registration: true }
    });

    if (!assignment?.registration)
      return NextResponse.json({ error: "Assignment or registration not found" }, { status: 404 });

    // --- Transaction : élimination + MAJ classement ---
    const result = await prisma.$transaction(async (tx) => {
      await tx.table_assignment.update({
        where: { id: assignment.id },
        data: { eliminated: true, user_kill_id: BigInt(user_kill_id) }
      });

      const aliveCount = await tx.table_assignment.count({
        where: {
          tournament_table: { tournament_id: BigInt(tournamentId) },
          eliminated: false,
          registration: { statut: "Confirmed" }
        }
      });

      const ranking_position = aliveCount + 1;
      const { score } = await getScoreAndRankingPosition(tx, tournamentId, ranking_position);

      await tx.tournament_ranking.deleteMany({
        where: {
          registration_id: assignment.registration.id,
          tournament_id: BigInt(tournamentId)
        }
      });
      await tx.tournament_ranking.create({
        data: {
          registration_id: assignment.registration.id,
          tournament_id: BigInt(tournamentId),
          ranking_position,
          ranking_score: score
        }
      });

      return { ranking_position, score, aliveCount };
    });

    // --- Rééquilibrage ---
    let rebalanced = false;
    let moves: {
      playerName: string;
      registrationId: number;
      fromTableId: number;
      fromTableNumber?: number;
      toTableId: number;
      toTableNumber?: number;
    }[] = [];

    if (tournament_category !== "SitAndGo") {
      const tables = await prisma.tournament_table.findMany({
        where: { tournament_id: BigInt(tournamentId) },
        include: { table_assignment: { where: { eliminated: false } } }
      });

      if (tables.filter(t => t.table_assignment.length > 0).length > 1) {
        const rebalancedData = await reequilibrateTables(tournamentId);
        if (typeof rebalancedData === "boolean") {
          rebalanced = rebalancedData;
        } else {
          rebalanced = rebalancedData.changed;
          moves = rebalancedData.moves ?? [];
        }
      }
    }

    // --- Dernier joueur vivant => fin tournoi ---
    if (result.aliveCount === 1) {
      const lastAssignment = await prisma.table_assignment.findFirst({
        where: {
          tournament_table: { tournament_id: BigInt(tournamentId) },
          eliminated: false
        },
        include: { registration: true }
      });

      if (lastAssignment?.registration) {
        const { score: lastScore } = await getScoreAndRankingPosition(prisma, tournamentId, 1);

        await prisma.tournament_ranking.deleteMany({
          where: {
            registration_id: lastAssignment.registration.id,
            tournament_id: BigInt(tournamentId)
          }
        });
        await prisma.tournament_ranking.create({
          data: {
            registration_id: lastAssignment.registration.id,
            tournament_id: BigInt(tournamentId),
            ranking_position: 1,
            ranking_score: lastScore
          }
        });
      }

      await prisma.tournament.update({
        where: { id: BigInt(tournamentId) },
        data: { tournament_status: tournament_tournament_status.finish }
      });

      await updateQuarterRanking(tournamentId);
    }

    return NextResponse.json(
      serializeBigInt({
        message: "Player eliminated and ranking recorded",
        ...result,
        rebalanced,
        moves
      })
    );

  } catch (error) {
    console.error("🔥 Error in eliminate route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
