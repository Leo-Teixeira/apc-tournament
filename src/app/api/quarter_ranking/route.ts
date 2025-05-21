import { NextResponse } from "next/server";
import { quarterRankingMocks } from "@/mock";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/app/utils/serializeBigInt";

const MOCK_MODE = process.env.MOCK === "true";

export async function GET() {
  if (MOCK_MODE) {
    return NextResponse.json(quarterRankingMocks ?? []);
  }

  try {
    const rankings = await prisma.quarter_ranking.findMany({
      include: {
        wp_users: {
          select: {
            ID: true,
            pseudo_winamax: true,
            display_name: true,
            user_email: true
          }
        }
      }
    });

    return NextResponse.json(serializeBigInt(rankings));
  } catch (error) {
    console.error("Error fetching quarter rankings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function updateQuarterRanking(tournamentId: number) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: BigInt(tournamentId) },
    select: {
      tournament_start_date: true,
      tournament_trimestry: true,
      tournament_category: true
    }
  });

  if (!tournament) {
    throw new Error("Tournoi introuvable pour le calcul trimestriel");
  }

  const year = tournament.tournament_start_date.getFullYear();
  const category = tournament.tournament_category;
  const trimestry = tournament.tournament_trimestry;

  const tournamentIds = await prisma.tournament.findMany({
    where: {
      tournament_category: category,
      tournament_trimestry: trimestry,
      tournament_start_date: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    },
    select: { id: true }
  });

  const allTournamentIds = tournamentIds.map((t) => t.id);

  const scores = await prisma.tournament_ranking.findMany({
    where: {
      tournament_id: { in: allTournamentIds }
    },
    select: {
      registration: {
        select: { user_id: true }
      },
      ranking_score: true
    }
  });

  const aggregated = new Map<number, number>();

  for (const entry of scores) {
    const userId = Number(entry.registration.user_id);
    const prev = aggregated.get(userId) ?? 0;
    aggregated.set(userId, prev + entry.ranking_score);
  }

  const sorted = Array.from(aggregated.entries()).sort((a, b) => b[1] - a[1]);

  const inserts = sorted.map(([user_id, aggregated_score], index) => ({
    user_id: BigInt(user_id),
    aggregated_score,
    position: index + 1,
    quarter_ranking_year: year,
    trimestry_ranking: trimestry
  }));

  await prisma.quarter_ranking.deleteMany({
    where: {
      quarter_ranking_year: year,
      trimestry_ranking: trimestry
    }
  });

  await prisma.quarter_ranking.createMany({ data: inserts });
}
