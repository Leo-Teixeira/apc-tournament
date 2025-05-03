import { tournamentLevelMocks, tournamentRankingMocks } from "@/mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string; } }
) {
  const { id } = await params;

  const result = tournamentLevelMocks.filter(
    (level) => level.tournament_id.id === id
  );

  return NextResponse.json(JSON.parse(JSON.stringify(result ?? [])));
}
