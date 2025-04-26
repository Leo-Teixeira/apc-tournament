import { Tournament } from "@/app/types";
import { tournamentMocks, tournamentRankingMocks } from "@/mock";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string; category: string } }
) {
  const { category, id } = await params;

  const result = tournamentRankingMocks.filter(
    (tournament) => tournament.id == id
  );
  return NextResponse.json(JSON.parse(JSON.stringify(result ?? {})));
}
