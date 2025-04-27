import { tournamentRankingMocks } from "@/mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string; category: string } }
) {
  const { id } = await params;

  const result = tournamentRankingMocks.filter(
    (ranking) => ranking.tournament_id.id === id
  );

  return NextResponse.json(JSON.parse(JSON.stringify(result ?? [])));
}
