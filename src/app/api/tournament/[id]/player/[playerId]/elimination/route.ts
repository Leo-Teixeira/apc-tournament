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
  const { tournament, player } = extractParamsFromPath(req, ["tournament", "player"]);

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
      where: { registration_id: BigInt(registrationId) },
      include: { registration: true }
    });

    if (!assignment || !assignment.registration) {
      return NextResponse.json({ error: "Assignment or registration not found" }, { status: 404 });
    }

    // Démarrer une transaction pour éviter conditions de concurrence
    const result = await prisma.$transaction(async (tx) => {
      // 1. Eliminer le joueur
      await tx.table_assignment.update({
        where: { id: assignment.id },
        data: {
          eliminated: true,
          user_kill_id: BigInt(user_kill_id)
        }
      });

      // 2. Recalculer le nombre de joueurs vivants Confirmed
      const aliveCount = await tx.table_assignment.count({
        where: {
          tournament_table: { tournament_id: BigInt(tournamentId) },
          eliminated: false,
          registration: { statut: "Confirmed" }
        }
      });

      // 3. Compter le total Confirmed (fixe)
      const totalRegistrations = await tx.registration.count({
        where: {
          tournament_id: BigInt(tournamentId),
          statut: "Confirmed"
        }
      });

      // 4. Calculer le ranking position: vivants + 1 (le classement inverse)
      const ranking_position = aliveCount + 1;

      // 5. Récupérer catégorie tournoi pour scores
      const tournamentData = await tx.tournament.findUnique({
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
        const range = aptScoreRanges.find(
          (r) => totalRegistrations >= r.min && totalRegistrations <= r.max
        );
        score = range?.scores[ranking_position - 1] ?? 0;
      } else if (tournamentData?.tournament_category === "SitAndGo") {
        const sitAndGoScores = {
          5: [5, 2, 0, 0, 0],
          6: [6, 3, 0, 0, 0, 0],
          7: [7, 4, 2, 0, 0, 0, 0],
          8: [8, 5, 3, 0, 0, 0, 0, 0],
          9: [9, 6, 4, 2, 0, 0, 0, 0, 0]
        };

        const scores = sitAndGoScores[totalRegistrations as keyof typeof sitAndGoScores];
        score = scores ? scores[ranking_position - 1] ?? 0 : 0;
      }


      // 6. Supprimer ancien classement du joueur et créer le nouveau
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

    // Optionnel : rééquilibrage des tables s'il y en a plusieurs avec joueurs vivants
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

    // Si un seul joueur vivant, fin du tournoi et mise à jour du classement trimestriel
    if (result.aliveCount === 1) {
      // 1. Identifier le dernier joueur vivant
      const lastAssignment = await prisma.table_assignment.findFirst({
        where: {
          tournament_table: { tournament_id: BigInt(tournamentId) },
          eliminated: false
        },
        include: { registration: true }
      });

      if (lastAssignment && lastAssignment.registration) {
        // recalculer les scores pour ce joueur en position 1
        let lastScore = 0;

        // Reprendre la même logique de score que plus haut
        const tournamentData = await prisma.tournament.findUnique({
          where: { id: BigInt(tournamentId) }
        });

        const totalRegistrations = await prisma.registration.count({
          where: {
            tournament_id: BigInt(tournamentId),
            statut: "Confirmed"
          }
        });

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
          const range = aptScoreRanges.find(
            (r) => totalRegistrations >= r.min && totalRegistrations <= r.max
          );
          lastScore = range?.scores[0] ?? 0; // 1ère place
        } else if (tournamentData?.tournament_category === "SitAndGo") {
          const sitAndGoScores = {
            5: [5, 2, 0, 0, 0],
            6: [6, 3, 0, 0, 0, 0],
            7: [7, 4, 2, 0, 0, 0, 0],
            8: [8, 5, 3, 0, 0, 0, 0, 0],
            9: [9, 6, 4, 2, 0, 0, 0, 0, 0]
          };
          const scores = sitAndGoScores[totalRegistrations as keyof typeof sitAndGoScores];
          lastScore = scores ? scores[0] ?? 0 : 0;
        }

        // Supprimer l'ancien classement si jamais il existe
        await prisma.tournament_ranking.deleteMany({
          where: {
            registration_id: lastAssignment.registration.id,
            tournament_id: BigInt(tournamentId)
          }
        });

        // Créer le classement pour le dernier survivant
        await prisma.tournament_ranking.create({
          data: {
            registration_id: lastAssignment.registration.id,
            tournament_id: BigInt(tournamentId),
            ranking_position: 1,
            ranking_score: lastScore
          }
        });
      }

      // Mettre à jour le statut du tournoi
      await prisma.tournament.update({
        where: { id: BigInt(tournamentId) },
        data: { tournament_status: tournament_tournament_status.finish }
      });

      // Mise à jour du classement trimestriel
      await updateQuarterRanking(tournamentId);
    }

    return NextResponse.json(
      serializeBigInt({ message: "Player eliminated and ranking recorded", ...result })
    );
  } catch (error) {
    console.error("🔥 Error in eliminate route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
